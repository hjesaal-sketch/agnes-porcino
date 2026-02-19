# backend/models/maternidad/Ingresos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field


# =============== SQLAlchemy ===============

class IngresoMaternidad(Base):
    __tablename__ = "maternity_entries"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha_ingreso = Column(Date, nullable=False)
    identificacion_madre = Column(String(50), nullable=False)
    lote = Column(String(50), nullable=True)
    raza = Column(String(50), nullable=True)
    age_meses = Column(Integer, nullable=False)
    motivo_ingreso = Column(String(20), nullable=False)  # Gestación | Parto | ...
    responsable = Column(String(100), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Alias para que Pydantic pueda mapear camelCase
    @property
    def fechaIngreso(self) -> date:
        return self.fecha_ingreso

    @property
    def identificacionMadre(self) -> str:
        return self.identificacion_madre

    @property
    def ageMeses(self) -> int:
        return self.age_meses

    @property
    def motivoIngreso(self) -> str:
        return self.motivo_ingreso

# =============== Pydantic ===============

class IngresoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fechaIngreso: date
    identificacionMadre: str = Field(..., max_length=50)
    lote: str = ""
    raza: str = ""
    ageMeses: int
    motivoIngreso: str
    responsable: str
    observaciones: Optional[str] = None


class IngresoCreate(IngresoBase):
    pass


class IngresoUpdate(BaseModel):
    fechaIngreso: Optional[date] = None
    identificacionMadre: Optional[str] = Field(None, max_length=50)
    lote: Optional[str] = None
    raza: Optional[str] = None
    ageMeses: Optional[int] = None
    motivoIngreso: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class IngresoRead(IngresoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class IngresoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[IngresoMaternidad]:
        return (
            self.db.query(IngresoMaternidad)
            .filter(
                IngresoMaternidad.empresa_id == empresa_id,
                IngresoMaternidad.granja_id == granja_id,
            )
            .order_by(IngresoMaternidad.fecha_ingreso.desc())
            .all()
        )

    def obtener_por_id(
        self, ingreso_id: int, empresa_id: int, granja_id: int
    ) -> Optional[IngresoMaternidad]:
        return (
            self.db.query(IngresoMaternidad)
            .filter(
                IngresoMaternidad.id == ingreso_id,
                IngresoMaternidad.empresa_id == empresa_id,
                IngresoMaternidad.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: IngresoCreate) -> IngresoMaternidad:
        ingreso = IngresoMaternidad(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha_ingreso=data.fechaIngreso,
            identificacion_madre=data.identificacionMadre,
            lote=data.lote,
            raza=data.raza,
            age_meses=data.ageMeses,
            motivo_ingreso=data.motivoIngreso,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(ingreso)
        self.db.commit()
        self.db.refresh(ingreso)
        return ingreso

    def actualizar(
        self, ingreso: IngresoMaternidad, cambios: IngresoUpdate
    ) -> IngresoMaternidad:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            if campo == "fechaIngreso":
                setattr(ingreso, "fecha_ingreso", valor)
            elif campo == "identificacionMadre":
                setattr(ingreso, "identificacion_madre", valor)
            elif campo == "ageMeses":
                setattr(ingreso, "age_meses", valor)
            elif campo == "motivoIngreso":
                setattr(ingreso, "motivo_ingreso", valor)
            else:
                setattr(ingreso, campo, valor)
        self.db.add(ingreso)
        self.db.commit()
        self.db.refresh(ingreso)
        return ingreso

    def eliminar(self, ingreso: IngresoMaternidad) -> None:
        self.db.delete(ingreso)
        self.db.commit()
