# backend/models/gestacion/Partos.py
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field

from backend.validators.gestacion_validators import (
    DatosEventoParto,
    GestacionValidators,
    GestacionValidationError,
)
from backend.models.gestacion.Madres import Madre
from backend.models.gestacion.Servicios import ServicioGestacion


# =========================
# MODELO SQLALCHEMY
# =========================


class PartoProgramado(Base):
    __tablename__ = "scheduled_farrowings"

    id = Column(Integer, primary_key=True, index=True)

    sow_id = Column(Integer, ForeignKey("sows.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    # Vinculación al servicio que originó este parto
    servicio_id = Column(
        Integer,
        ForeignKey("gestation_services.id"),  # corregido: nombre real de la tabla
        nullable=True,
    )

    # Fechas clave
    fecha_servicio = Column(Date, nullable=False)
    fecha_probable = Column(Date, nullable=False)

    # Tipo de servicio (Natural, Inseminación, etc.)
    tipo_servicio = Column(String(30), nullable=False)

    observaciones = Column(Text, nullable=True)

    # Si ya ocurrió
    realizado = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =========================
# ESQUEMAS Pydantic (API)
# =========================


class PartoBase(BaseModel):
    idMadre: str = Field(..., max_length=50)
    granja_id: int
    fechaServicio: date
    fechaProbableParto: Optional[date] = None
    tipoServicio: str
    observaciones: Optional[str] = None
    realizado: bool = False
    servicio_id: Optional[int] = None


class PartoCreate(PartoBase):
    pass


class PartoUpdate(BaseModel):
    fechaServicio: Optional[date] = None
    fechaProbableParto: Optional[date] = None
    tipoServicio: Optional[str] = None
    observaciones: Optional[str] = None
    realizado: Optional[bool] = None
    servicio_id: Optional[int] = None


class PartoRead(PartoBase):
    id: int
    sow_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# REPOSITORIO / SERVICIO
# =========================


class PartosProgramadosRepository:
    """Acceso a datos para partos programados."""

    def __init__(self, db: Session):
        self.db = db

    # --- Lectura ---

    def listar_por_granja(self, granja_id: int) -> List[PartoProgramado]:
        return (
            self.db.query(PartoProgramado)
            .filter(PartoProgramado.granja_id == granja_id)
            .order_by(PartoProgramado.fecha_probable)
            .all()
        )

    def obtener_por_id(
        self,
        parto_id: int,
        granja_id: int,
    ) -> Optional[PartoProgramado]:
        return (
            self.db.query(PartoProgramado)
            .filter(
                PartoProgramado.id == parto_id,
                PartoProgramado.granja_id == granja_id,
            )
            .first()
        )

    # --- Helpers ---

    def _obtener_o_crear_madre(self, identificacion: str, granja_id: int) -> int:
        """
        Busca la madre por identificación + granja en la tabla sows.
        Si no existe, la crea mínima (identificacion + granja) y devuelve su id.
        """
        madre = (
            self.db.query(Madre)
            .filter(
                Madre.identificacion == identificacion,
                Madre.granja_id == granja_id,
            )
            .first()
        )
        if madre is None:
            madre = Madre(
                identificacion=identificacion,
                granja_id=granja_id,
            )
            self.db.add(madre)
            self.db.flush()

        return madre.id

    def _validar_servicio_referenciado(
        self,
        servicio_id: Optional[int],
        granja_id: int,
    ) -> Optional[ServicioGestacion]:
        """
        Si se indica servicio_id, valida que exista y pertenezca a la misma granja.
        Devuelve el servicio si es válido, o None si no se indicó servicio_id.
        """
        if servicio_id is None:
            return None

        servicio = (
            self.db.query(ServicioGestacion)
            .filter(
                ServicioGestacion.id == servicio_id,
                ServicioGestacion.granja_id == granja_id,
            )
            .first()
        )

        if servicio is None:
            raise ValueError(
                "El servicio referenciado no existe o no pertenece a la granja."
            )

        return servicio

    # --- Escritura ---

    def crear(self, data: PartoCreate) -> PartoProgramado:
        sow_id = self._obtener_o_crear_madre(
            identificacion=data.idMadre,
            granja_id=data.granja_id,
        )

        # Validar referencia de servicio (si viene)
        servicio = self._validar_servicio_referenciado(
            servicio_id=data.servicio_id,
            granja_id=data.granja_id,
        )

        # Validar fechas y eventos (fecha de servicio para este parto programado)
        datos_evento = DatosEventoParto(
            sow_id=sow_id,
            granja_id=data.granja_id,
            fecha_evento=data.fechaServicio,
            tipo_evento="servicio",
        )
        GestacionValidators.validar_evento_parto(self.db, datos_evento)

        # Calcular fecha probable si no viene
        fecha_probable = (
            data.fechaProbableParto
            if data.fechaProbableParto is not None
            else data.fechaServicio + timedelta(days=114)
        )

        parto = PartoProgramado(
            sow_id=sow_id,
            granja_id=data.granja_id,
            servicio_id=servicio.id if servicio is not None else None,
            fecha_servicio=data.fechaServicio,
            fecha_probable=fecha_probable,
            tipo_servicio=data.tipoServicio,
            observaciones=data.observaciones,
            realizado=data.realizado,
        )
        self.db.add(parto)
        self.db.commit()
        self.db.refresh(parto)
        return parto

    def actualizar(
        self,
        parto: PartoProgramado,
        cambios: PartoUpdate,
    ) -> PartoProgramado:
        datos = cambios.dict(exclude_unset=True)

        # Si cambia la referencia de servicio, validar
        if "servicio_id" in datos:
            servicio = self._validar_servicio_referenciado(
                servicio_id=datos["servicio_id"],
                granja_id=parto.granja_id,
            )
            parto.servicio_id = servicio.id if servicio is not None else None

        # Si cambia la fecha de servicio, validar
        if "fechaServicio" in datos:
            datos_evento = DatosEventoParto(
                sow_id=parto.sow_id,
                granja_id=parto.granja_id,
                fecha_evento=datos["fechaServicio"],
                tipo_evento="servicio",
            )
            GestacionValidators.validar_evento_parto(self.db, datos_evento)
            parto.fecha_servicio = datos["fechaServicio"]

        if "fechaProbableParto" in datos:
            parto.fecha_probable = datos["fechaProbableParto"]
        if "tipoServicio" in datos:
            parto.tipo_servicio = datos["tipoServicio"]
        if "observaciones" in datos:
            parto.observaciones = datos["observaciones"]
        if "realizado" in datos:
            parto.realizado = datos["realizado"]

        self.db.add(parto)
        self.db.commit()
        self.db.refresh(parto)
        return parto

    def eliminar(self, parto: PartoProgramado) -> None:
        self.db.delete(parto)
        self.db.commit()
