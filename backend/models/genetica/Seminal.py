# backend/models/genetica/Seminal.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class RegistroSeminalModel(Base):
    __tablename__ = "genetica_seminal"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    identificacion = Column(String(80), nullable=False)
    raza = Column(String(80), nullable=False)
    volumen = Column(Float, nullable=False)
    concentracion = Column(Float, nullable=False)
    motilidad = Column(String(80), nullable=False)
    calidad = Column(String(30), nullable=False)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# ===== Pydantic =====

class RegistroSeminalBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    identificacion: str
    raza: str
    volumen: float = Field(ge=0)
    concentracion: float = Field(ge=0)
    motilidad: str
    calidad: str   # "Excelente" | "Buena" | "Regular" | "Deficiente"
    responsable: str
    observaciones: Optional[str] = None


class RegistroSeminalCreate(RegistroSeminalBase):
    pass


class RegistroSeminalUpdate(BaseModel):
    fecha: Optional[date] = None
    identificacion: Optional[str] = None
    raza: Optional[str] = None
    volumen: Optional[float] = Field(default=None, ge=0)
    concentracion: Optional[float] = Field(default=None, ge=0)
    motilidad: Optional[str] = None
    calidad: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class RegistroSeminalRead(RegistroSeminalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====

class SeminalRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[RegistroSeminalModel]:
        return (
            self.db.query(RegistroSeminalModel)
            .filter(
                RegistroSeminalModel.empresa_id == empresa_id,
                RegistroSeminalModel.granja_id == granja_id,
            )
            .order_by(RegistroSeminalModel.fecha.desc(), RegistroSeminalModel.id.desc())
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[RegistroSeminalModel]:
        return (
            self.db.query(RegistroSeminalModel)
            .filter(
                RegistroSeminalModel.id == reg_id,
                RegistroSeminalModel.empresa_id == empresa_id,
                RegistroSeminalModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: RegistroSeminalCreate) -> RegistroSeminalModel:
        reg = RegistroSeminalModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            identificacion=data.identificacion,
            raza=data.raza,
            volumen=data.volumen,
            concentracion=data.concentracion,
            motilidad=data.motilidad,
            calidad=data.calidad,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: RegistroSeminalModel, cambios: RegistroSeminalUpdate
    ) -> RegistroSeminalModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: RegistroSeminalModel) -> None:
        self.db.delete(reg)
        self.db.commit()
