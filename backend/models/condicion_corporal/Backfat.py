# backend/models/condicion_corporal/Backfat.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import Session

from pydantic import BaseModel, Field, validator

from backend.database import Base
from backend.models.gestacion.Madres import Madre


# =============== SQLAlchemy ===============


class BackfatModel(Base):
    """
    Mediciones de grasa dorsal (mm) por cerda.

    Cada registro es una medición puntual, no el "estado actual".
    """
    __tablename__ = "sows_backfat_measurements"

    id = Column(Integer, primary_key=True, index=True)

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)
    sow_id = Column(Integer, ForeignKey("sows.id"), nullable=False)

    fecha_medicion = Column(Date, nullable=False)
    valor_mm = Column(Float, nullable=False)

    equipo = Column(String(100), nullable=True)       # Marca/modelo del equipo
    usuario = Column(String(100), nullable=True)      # Operador que midió
    etapa = Column(String(30), nullable=False)        # gestacion, lactancia, reposo, etc.
    observaciones = Column(Text, nullable=True)

    activo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic Schemas ===============


class BackfatBase(BaseModel):
    empresa_id: int
    granja_id: int
    sow_id: int

    fecha_medicion: date
    valor_mm: float = Field(..., description="Espesor de grasa dorsal en mm")

    equipo: str = ""
    usuario: str = ""
    etapa: str
    observaciones: Optional[str] = None

    @validator("valor_mm")
    def validar_rango_valor_mm(cls, v: float) -> float:
        """
        Rango de trabajo placeholder: 5–30 mm.
        Más adelante se puede afinar por genética/etapa.
        """
        if v <= 0:
            raise ValueError("El valor de I. G. Dorsal debe ser mayor que cero.")
        if v < 5 or v > 30:
            raise ValueError(
                "El valor de I. G. Dorsal parece fuera de rango (5–30 mm). "
                "Verifica la medición."
            )
        return v

    @validator("etapa")
    def validar_etapa(cls, v: str) -> str:
        # Lista base; puedes ampliarla según tu flujo real
        etapas_validas = {"gestacion", "lactancia", "reposo", "reemplazo"}
        v_norm = v.strip().lower()
        if v_norm not in etapas_validas:
            raise ValueError(
                f"Etapa '{v}' no es válida. Valores permitidos: "
                f"{', '.join(sorted(etapas_validas))}."
            )
        return v_norm


class BackfatCreate(BackfatBase):
    pass


class BackfatUpdate(BaseModel):
    """
    Permite correcciones de mediciones ya registradas.
    """
    fecha_medicion: Optional[date] = None
    valor_mm: Optional[float] = None
    equipo: Optional[str] = None
    usuario: Optional[str] = None
    etapa: Optional[str] = None
    observaciones: Optional[str] = None

    @validator("valor_mm")
    def validar_rango_valor_mm(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        if v <= 0:
            raise ValueError("El valor de I. G. Dorsal debe ser mayor que cero.")
        if v < 5 or v > 30:
            raise ValueError(
                "El valor de I. G. Dorsal parece fuera de rango (5–30 mm). "
                "Verifica la medición."
            )
        return v

    @validator("etapa")
    def validar_etapa(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        etapas_validas = {"gestacion", "lactancia", "reposo", "reemplazo"}
        v_norm = v.strip().lower()
        if v_norm not in etapas_validas:
            raise ValueError(
                f"Etapa '{v}' no es válida. Valores permitidos: "
                f"{', '.join(sorted(etapas_validas))}."
            )
        return v_norm


class BackfatRead(BackfatBase):
    id: int
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Reglas de negocio (validador simple) ===============


class BackfatValidationError(ValueError):
    """Errores de validación de reglas de negocio para grasa dorsal."""


class BackfatValidators:
    """
    Reglas de negocio adicionales no cubiertas por Pydantic.

    - Rango de valores ya se valida en los schemas (5–30 mm).
    - Evitar mediciones duplicadas en misma fecha/etapa para la misma cerda.
    - Frecuencia mínima: no más de una medición por día y etapa.
    - Coherencia de etapa con estado productivo de la madre.
    """

    # ---------- Fechas ----------

    @staticmethod
    def validar_fecha_no_futura(fecha: date, hoy: Optional[date] = None) -> None:
        if hoy is None:
            from datetime import date as _date
            hoy = _date.today()
        if fecha > hoy:
            raise BackfatValidationError(
                "La fecha de medición no puede estar en el futuro."
            )

    # ---------- Frecuencia / duplicados ----------

    @staticmethod
    def validar_no_duplicada(
        db: Session,
        datos: BackfatCreate,
        medicion_id_excluir: Optional[int] = None,
    ) -> None:
        """
        No permitir dos mediciones activas con misma sow/fecha/etapa.
        Equivale a limitar a una medición por día y etapa para cada cerda.
        """
        query = db.query(BackfatModel).filter(
            BackfatModel.empresa_id == datos.empresa_id,
            BackfatModel.granja_id == datos.granja_id,
            BackfatModel.sow_id == datos.sow_id,
            BackfatModel.fecha_medicion == datos.fecha_medicion,
            BackfatModel.etapa == datos.etapa.strip().lower(),
            BackfatModel.activo.is_(True),
        )
        if medicion_id_excluir is not None:
            query = query.filter(BackfatModel.id != medicion_id_excluir)

        existe = query.first()
        if existe:
            raise BackfatValidationError(
                "Ya existe una medición activa de I. G. Dorsal para esta cerda, "
                "fecha y etapa."
            )

    # ---------- Coherencia con estado productivo ----------

    @staticmethod
    def validar_coherencia_con_estado_madre(
        db: Session,
        datos: BackfatCreate,
    ) -> None:
        """
        Valida que la etapa de la medición tenga sentido con el estado_actual de la madre,
        si esa información está disponible.

        Reglas base (ajustables):
        - estado_actual 'Gestante'      -> etapa permitida: gestacion
        - estado_actual 'Parida'       -> etapa permitida: lactancia
        - estado_actual 'Reemplazo'    -> etapas permitidas: reemplazo, reposo
        - estado_actual 'Vacía'        -> etapas permitidas: reposo, reemplazo
        - estado_actual 'Aborto','Baja'-> se prohíben nuevas mediciones
        """
        madre: Optional[Madre] = (
            db.query(Madre)
            .filter(
                Madre.id == datos.sow_id,
                Madre.granja_id == datos.granja_id,
            )
            .first()
        )
        if madre is None:
            # Si no encontramos la madre, por ahora no bloqueamos;
            # asumimos que se trata de un dato histórico o inconsistencia
            return

        estado = (madre.estado_actual or "").strip()
        etapa = datos.etapa.strip().lower()

        # Estados que bloquean mediciones nuevas
        if estado in {"Baja"}:
            raise BackfatValidationError(
                f"No se puede registrar I. G. Dorsal para una madre en estado '{estado}'."
            )

        # Mapear estado_actual a etapas permitidas
        estado_lower = estado.lower()
        etapas_permitidas: List[str]

        if estado_lower in {"gestante", "gestación"}:
            etapas_permitidas = ["gestacion"]
        elif estado_lower in {"parida"}:
            etapas_permitidas = ["lactancia"]
        elif estado_lower in {"reemplazo"}:
            etapas_permitidas = ["reemplazo", "reposo"]
        elif estado_lower in {"vacía", "vacia"}:
            etapas_permitidas = ["reposo", "reemplazo"]
        elif estado_lower in {"aborto"}:
            etapas_permitidas = []  # podrías permitir reposo si lo decides
        else:
            # Estados no mapeados: no bloqueamos, solo avisar lógicamente
            return

        if etapas_permitidas and etapa not in etapas_permitidas:
            raise BackfatValidationError(
                f"La etapa '{etapa}' no es coherente con el estado actual de la madre "
                f"('{estado}'). Etapas permitidas para este estado: "
                f"{', '.join(etapas_permitidas)}."
            )


# =============== Repositorio ===============


class BackfatRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---- Creación ----

    def crear(self, data: BackfatCreate) -> BackfatModel:
        # Reglas adicionales
        BackfatValidators.validar_fecha_no_futura(data.fecha_medicion)
        BackfatValidators.validar_no_duplicada(self.db, data)
        BackfatValidators.validar_coherencia_con_estado_madre(self.db, data)

        reg = BackfatModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            sow_id=data.sow_id,
            fecha_medicion=data.fecha_medicion,
            valor_mm=data.valor_mm,
            equipo=data.equipo,
            usuario=data.usuario,
            etapa=data.etapa.strip().lower(),
            observaciones=data.observaciones,
            activo=True,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    # ---- Lectura ----

    def obtener_por_id(
        self, medicion_id: int, empresa_id: int, granja_id: int
    ) -> Optional[BackfatModel]:
        return (
            self.db.query(BackfatModel)
            .filter(
                BackfatModel.id == medicion_id,
                BackfatModel.empresa_id == empresa_id,
                BackfatModel.granja_id == granja_id,
            )
            .first()
        )

    def listar_por_cerda(
        self,
        empresa_id: int,
        granja_id: int,
        sow_id: int,
        etapa: Optional[str] = None,
    ) -> List[BackfatModel]:
        query = (
            self.db.query(BackfatModel)
            .filter(
                BackfatModel.empresa_id == empresa_id,
                BackfatModel.granja_id == granja_id,
                BackfatModel.sow_id == sow_id,
                BackfatModel.activo.is_(True),
            )
            .order_by(BackfatModel.fecha_medicion.asc())
        )
        if etapa:
            query = query.filter(BackfatModel.etapa == etapa.strip().lower())
        return query.all()

    def listar_por_periodo(
        self,
        empresa_id: int,
        granja_id: int,
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        etapa: Optional[str] = None,
        sow_id: Optional[int] = None,
    ) -> List[BackfatModel]:
        query = (
            self.db.query(BackfatModel)
            .filter(
                BackfatModel.empresa_id == empresa_id,
                BackfatModel.granja_id == granja_id,
                BackfatModel.activo.is_(True),
            )
            .order_by(BackfatModel.fecha_medicion.asc())
        )

        if sow_id is not None:
            query = query.filter(BackfatModel.sow_id == sow_id)

        if fecha_desde is not None:
            query = query.filter(BackfatModel.fecha_medicion >= fecha_desde)

        if fecha_hasta is not None:
            query = query.filter(BackfatModel.fecha_medicion <= fecha_hasta)

        if etapa:
            query = query.filter(BackfatModel.etapa == etapa.strip().lower())

        return query.all()

    # ---- Actualización ----

    def actualizar(
        self,
        reg: BackfatModel,
        cambios: BackfatUpdate,
    ) -> BackfatModel:
        datos = cambios.dict(exclude_unset=True)

        # Aplicar cambios en el modelo
        for campo, valor in datos.items():
            if campo == "etapa" and valor is not None:
                setattr(reg, campo, valor.strip().lower())
            else:
                setattr(reg, campo, valor)

        # Reconstruir un BackfatCreate para revalidar duplicados/fecha/coherencia
        data_validacion = BackfatCreate(
            empresa_id=reg.empresa_id,
            granja_id=reg.granja_id,
            sow_id=reg.sow_id,
            fecha_medicion=reg.fecha_medicion,
            valor_mm=reg.valor_mm,
            equipo=reg.equipo or "",
            usuario=reg.usuario or "",
            etapa=reg.etapa,
            observaciones=reg.observaciones,
        )

        BackfatValidators.validar_fecha_no_futura(data_validacion.fecha_medicion)
        BackfatValidators.validar_no_duplicada(
            self.db,
            data_validacion,
            medicion_id_excluir=reg.id,
        )
        BackfatValidators.validar_coherencia_con_estado_madre(
            self.db,
            data_validacion,
        )

        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    # ---- Borrado lógico ----

    def eliminar_logico(self, reg: BackfatModel) -> BackfatModel:
        """
        Marca la medición como inactiva (borrado lógico).
        El registro permanece para historial/auditoría.
        """
        reg.activo = False
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
