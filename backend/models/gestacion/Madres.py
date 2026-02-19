# backend/models/gestacion/Madres.py

from __future__ import annotations

from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field

from backend.validators.estado_animal import (
    DatosMadre,
    EstadoAnimalValidators,
)


# =========================
# MODELO SQLALCHEMY
# =========================


class Madre(Base):
    __tablename__ = "sows"

    id = Column(Integer, primary_key=True, index=True)
    identificacion = Column(String, unique=True, nullable=False, index=True)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    # Datos productivos/básicos
    raza = Column(String(50), nullable=True)
    lote = Column(String(50), nullable=True)

    # Fecha de nacimiento persistente
    fecha_nacimiento = Column(Date, nullable=True)

    edad_meses = Column(Integer, nullable=True)
    observaciones = Column(Text, nullable=True)

    # Nueva info reproductiva
    paridad = Column(Integer, nullable=False, default=0)
    causa_baja = Column(Text, nullable=True)

    estado_actual = Column(String(30), nullable=False, default="Reemplazo")
    fecha_alta = Column(Date, nullable=False, default=date.today)
    activo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Mapeos de conveniencia para Pydantic / front

    @property
    def edadMeses(self) -> Optional[int]:
        return self.edad_meses

    @property
    def fechaIngreso(self) -> date:
        return self.fecha_alta

    @property
    def fechaNacimiento(self) -> Optional[date]:
        return self.fecha_nacimiento


# =========================
# ESQUEMAS Pydantic (API)
# =========================


class MadreBase(BaseModel):
    identificacion: str = Field(..., max_length=50)
    granja_id: int
    raza: Optional[str] = None
    lote: Optional[str] = None
    # Campos de fechas en camelCase para el front
    fechaIngreso: date = Field(default_factory=date.today)
    fechaNacimiento: Optional[date] = None
    edadMeses: Optional[int] = None
    observaciones: Optional[str] = None
    # reproductivo
    paridad: int = 0
    estado_actual: str = "Reemplazo"
    activo: bool = True


class MadreCreate(MadreBase):
    pass


class MadreUpdate(BaseModel):
    raza: Optional[str] = None
    lote: Optional[str] = None
    fechaNacimiento: Optional[date] = None
    edadMeses: Optional[int] = None
    observaciones: Optional[str] = None
    paridad: Optional[int] = None
    estado_actual: Optional[str] = None
    activo: Optional[bool] = None
    causa_baja: Optional[str] = None


class MadreRead(MadreBase):
    id: int
    fecha_alta: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    causa_baja: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# REPOSITORIO / SERVICIO
# =========================


class MadresRepository:
    """Acceso a datos para madres (sows)."""

    def __init__(self, db: Session):
        self.db = db

    # --- Lectura ---

    def listar_por_granja(self, granja_id: int) -> List[Madre]:
        return (
            self.db.query(Madre)
            .filter(Madre.granja_id == granja_id)
            .order_by(Madre.identificacion)
            .all()
        )

    def obtener_por_id(self, madre_id: int, granja_id: int) -> Optional[Madre]:
        return (
            self.db.query(Madre)
            .filter(Madre.id == madre_id, Madre.granja_id == granja_id)
            .first()
        )

    def obtener_por_identificacion(
        self, identificacion: str, granja_id: int
    ) -> Optional[Madre]:
        return (
            self.db.query(Madre)
            .filter(
                Madre.identificacion == identificacion,
                Madre.granja_id == granja_id,
            )
            .first()
        )

    # --- Helpers de conversión a DTO ---

    def _to_datos_madre(self, madre: Madre) -> DatosMadre:
        return DatosMadre(
            id=madre.id,
            empresa_id=None,
            granja_id=madre.granja_id,
            identificacion=madre.identificacion,
            fecha_nacimiento=madre.fecha_nacimiento,
            estado_actual=madre.estado_actual,  # type: ignore[arg-type]
            activo=madre.activo,
            paridad=madre.paridad,
            fecha_alta=madre.fecha_alta,
            causa_baja=madre.causa_baja,
        )

    # --- Escritura ---

    def crear(self, data: MadreCreate) -> Madre:
        # Evitar duplicados por identificacion + granja
        existente = self.obtener_por_identificacion(
            identificacion=data.identificacion,
            granja_id=data.granja_id,
        )
        if existente:
            raise ValueError(
                "Ya existe una madre con esa identificación en la granja"
            )

        # Validación de alta (cerebro de estados)
        dto = DatosMadre(
            id=None,
            empresa_id=None,
            granja_id=data.granja_id,
            identificacion=data.identificacion,
            fecha_nacimiento=data.fechaNacimiento,
            estado_actual=data.estado_actual,  # type: ignore[arg-type]
            activo=data.activo,
            paridad=data.paridad,
            fecha_alta=data.fechaIngreso,
        )
        EstadoAnimalValidators.validar_alta(
            madre_nueva=dto,
            identificaciones_existentes=[existente.identificacion]
            if existente
            else [],
            hoy=date.today(),
        )

        madre = Madre(
            identificacion=data.identificacion,
            granja_id=data.granja_id,
            raza=data.raza or None,
            lote=data.lote or None,
            # mapear fechas y edad
            fecha_alta=data.fechaIngreso,
            fecha_nacimiento=data.fechaNacimiento,
            edad_meses=data.edadMeses,
            observaciones=data.observaciones,
            paridad=data.paridad,
            estado_actual=data.estado_actual,
            activo=data.activo,
        )
        self.db.add(madre)
        self.db.commit()
        self.db.refresh(madre)
        return madre

    def actualizar(self, madre: Madre, cambios: MadreUpdate) -> Madre:
        datos = cambios.dict(exclude_unset=True)

        # Si viene un cambio de estado, validarlo primero
        nuevo_estado = datos.get("estado_actual")
        if nuevo_estado is not None:
            dto = self._to_datos_madre(madre)
            EstadoAnimalValidators.validar_cambio_estado(
                madre=dto,
                nuevo_estado=nuevo_estado,  # type: ignore[arg-type]
            )

        # Si viene causa_baja y cambio a Baja, validar baja
        if nuevo_estado == "Baja":
            causa = datos.get("causa_baja") or madre.causa_baja
            dto = self._to_datos_madre(madre)
            EstadoAnimalValidators.validar_baja(dto, causa)

        for campo, valor in datos.items():
            if campo == "edadMeses":
                setattr(madre, "edad_meses", valor)
            elif campo == "fechaNacimiento":
                setattr(madre, "fecha_nacimiento", valor)
            else:
                setattr(madre, campo, valor)

        # Si quedó en Baja, marcar activo = False por consistencia
        if madre.estado_actual == "Baja":
            madre.activo = False

        self.db.add(madre)
        self.db.commit()
        self.db.refresh(madre)
        return madre

    def dar_baja(self, madre: Madre, causa_baja: str) -> Madre:
        """
        Baja explícita de una madre por descarte.
        Usa el cerebro de estados para validar y luego marca:
        - estado_actual = 'Baja'
        - causa_baja = causa_baja
        - activo = False
        """
        dto = self._to_datos_madre(madre)
        EstadoAnimalValidators.validar_baja(dto, causa_baja)

        madre.estado_actual = "Baja"
        madre.causa_baja = causa_baja
        madre.activo = False

        self.db.add(madre)
        self.db.commit()
        self.db.refresh(madre)
        return madre

    def eliminar(self, madre: Madre) -> None:
        self.db.delete(madre)
        self.db.commit()
