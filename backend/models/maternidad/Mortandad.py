# backend/models/maternidad/Mortandad.py
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

class MortalidadMaternidadModel(Base):
    __tablename__ = "maternity_mortality"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    identificacion_madre = Column(String(50), nullable=False)
    tipo = Column(String(10), nullable=False)          # Madre | Lechón
    causa = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False)
    responsable = Column(String(100), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Exponer identificacionMadre para Pydantic (nombre camelCase usado en los esquemas)
    @property
    def identificacionMadre(self) -> str:
        return self.identificacion_madre


# =============== Pydantic ===============

class MortalidadBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    identificacionMadre: str = Field(..., max_length=50)
    tipo: str
    causa: str
    cantidad: int
    responsable: str
    observaciones: Optional[str] = None


class MortalidadCreate(MortalidadBase):
    pass


class MortalidadUpdate(BaseModel):
    fecha: Optional[date] = None
    identificacionMadre: Optional[str] = Field(None, max_length=50)
    tipo: Optional[str] = None
    causa: Optional[str] = None
    cantidad: Optional[int] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class MortalidadRead(MortalidadBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class MortalidadRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[MortalidadMaternidadModel]:
        return (
            self.db.query(MortalidadMaternidadModel)
            .filter(
                MortalidadMaternidadModel.empresa_id == empresa_id,
                MortalidadMaternidadModel.granja_id == granja_id,
            )
            .order_by(MortalidadMaternidadModel.fecha.desc())
            .all()
        )

    def obtener_por_id(
        self, registro_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MortalidadMaternidadModel]:
        return (
            self.db.query(MortalidadMaternidadModel)
            .filter(
                MortalidadMaternidadModel.id == registro_id,
                MortalidadMaternidadModel.empresa_id == empresa_id,
                MortalidadMaternidadModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: MortalidadCreate) -> MortalidadMaternidadModel:
        reg = MortalidadMaternidadModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            identificacion_madre=data.identificacionMadre,
            tipo=data.tipo,
            causa=data.causa,
            cantidad=data.cantidad,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: MortalidadMaternidadModel, cambios: MortalidadUpdate
    ) -> MortalidadMaternidadModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            if campo == "identificacionMadre":
                setattr(reg, "identificacion_madre", valor)
            else:
                setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: MortalidadMaternidadModel) -> None:
        self.db.delete(reg)
        self.db.commit()
