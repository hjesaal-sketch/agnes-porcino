# backend/models/insumos/Equipos.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from pydantic import BaseModel
from backend.database import Base


# =============== SQLAlchemy ===============

class EquipoModel(Base):
    __tablename__ = "supplies_equipments"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    descripcion = Column(String(150), nullable=False)
    categoria = Column(String(50), nullable=False)      # Herramienta, Equipo mayor, etc.
    marca = Column(String(100), nullable=True)
    modelo = Column(String(100), nullable=True)
    serie = Column(String(100), nullable=True)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    stock = Column(Float, nullable=False)
    ubicacion = Column(String(150), nullable=True)
    proveedor = Column(String(120), nullable=True)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============

class EquipoBase(BaseModel):
    empresa_id: int
    granja_id: int

    descripcion: str
    categoria: str
    marca: str = ""
    modelo: str = ""
    serie: str = ""
    cantidad: float
    unidad: str
    stock: float
    ubicacion: str = ""
    proveedor: str = ""
    observaciones: Optional[str] = None


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    serie: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    stock: Optional[float] = None
    ubicacion: Optional[str] = None
    proveedor: Optional[str] = None
    observaciones: Optional[str] = None


class EquipoRead(EquipoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class EquipoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[EquipoModel]:
        return (
            self.db.query(EquipoModel)
            .filter(
                EquipoModel.empresa_id == empresa_id,
                EquipoModel.granja_id == granja_id,
            )
            .order_by(EquipoModel.descripcion.asc())
            .all()
        )

    def obtener_por_id(
        self, equipo_id: int, empresa_id: int, granja_id: int
    ) -> Optional[EquipoModel]:
        return (
            self.db.query(EquipoModel)
            .filter(
                EquipoModel.id == equipo_id,
                EquipoModel.empresa_id == empresa_id,
                EquipoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: EquipoCreate) -> EquipoModel:
        reg = EquipoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            descripcion=data.descripcion,
            categoria=data.categoria,
            marca=data.marca,
            modelo=data.modelo,
            serie=data.serie,
            cantidad=data.cantidad,
            unidad=data.unidad,
            stock=data.stock,
            ubicacion=data.ubicacion,
            proveedor=data.proveedor,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: EquipoModel, cambios: EquipoUpdate
    ) -> EquipoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: EquipoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
