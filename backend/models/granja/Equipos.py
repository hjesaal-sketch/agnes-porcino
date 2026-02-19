# backend/models/granja/Equipos.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class EquipoGranjaModel(Base):
    __tablename__ = "farm_equipment"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    descripcion = Column(Text, nullable=False)
    categoria = Column(String(50), nullable=False)
    marca = Column(String(100), nullable=False)
    modelo = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False)
    estado = Column(String(30), nullable=False)
    ubicacion = Column(String(120), nullable=False)
    responsable = Column(String(120), nullable=True)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ========= Pydantic =========

class EquipoGranjaBase(BaseModel):
    empresa_id: int
    granja_id: int

    descripcion: str
    categoria: str  # "Maquinaria" | "Herramienta" | "Equipo Electrónico" | "Vehículo" | "Otro"
    marca: str
    modelo: str
    cantidad: int = Field(ge=0)
    estado: str    # "Operativo" | "Mantenimiento" | "Baja"
    ubicacion: str
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class EquipoGranjaCreate(EquipoGranjaBase):
    pass


class EquipoGranjaUpdate(BaseModel):
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    cantidad: Optional[int] = Field(default=None, ge=0)
    estado: Optional[str] = None
    ubicacion: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class EquipoGranjaRead(EquipoGranjaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========= Repositorio =========

class EquipoGranjaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[EquipoGranjaModel]:
        return (
            self.db.query(EquipoGranjaModel)
            .filter(
                EquipoGranjaModel.empresa_id == empresa_id,
                EquipoGranjaModel.granja_id == granja_id,
            )
            .order_by(EquipoGranjaModel.descripcion.asc(), EquipoGranjaModel.id.asc())
            .all()
        )

    def obtener_por_id(
        self, equipo_id: int, empresa_id: int, granja_id: int
    ) -> Optional[EquipoGranjaModel]:
        return (
            self.db.query(EquipoGranjaModel)
            .filter(
                EquipoGranjaModel.id == equipo_id,
                EquipoGranjaModel.empresa_id == empresa_id,
                EquipoGranjaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: EquipoGranjaCreate) -> EquipoGranjaModel:
        reg = EquipoGranjaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            descripcion=data.descripcion,
            categoria=data.categoria,
            marca=data.marca,
            modelo=data.modelo,
            cantidad=data.cantidad,
            estado=data.estado,
            ubicacion=data.ubicacion,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: EquipoGranjaModel, cambios: EquipoGranjaUpdate
    ) -> EquipoGranjaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: EquipoGranjaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
