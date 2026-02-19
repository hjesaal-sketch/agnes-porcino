# backend/models/granja/Infraestructura.py
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
    Float,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class ZonaGranjaModel(Base):
    __tablename__ = "farm_zones"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(120), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo = Column(String(40), nullable=False)
    ubicacionGPS = Column(String(80), nullable=False)
    areaM2 = Column(Float, nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ===== Pydantic =====

class ZonaGranjaBase(BaseModel):
    empresa_id: int
    granja_id: int

    nombre: str
    descripcion: str
    tipo: str                 # "Productiva" | "Administrativa" | "Servicios" | "Biodiversidad" | "Otro"
    ubicacionGPS: str         # "lat,lon"
    areaM2: float = Field(ge=0)
    observaciones: Optional[str] = None


class ZonaGranjaCreate(ZonaGranjaBase):
    pass


class ZonaGranjaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    ubicacionGPS: Optional[str] = None
    areaM2: Optional[float] = Field(default=None, ge=0)
    observaciones: Optional[str] = None


class ZonaGranjaRead(ZonaGranjaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====

class ZonaGranjaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ZonaGranjaModel]:
        return (
            self.db.query(ZonaGranjaModel)
            .filter(
                ZonaGranjaModel.empresa_id == empresa_id,
                ZonaGranjaModel.granja_id == granja_id,
            )
            .order_by(ZonaGranjaModel.nombre.asc())
            .all()
        )

    def obtener_por_id(
        self, zona_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ZonaGranjaModel]:
        return (
            self.db.query(ZonaGranjaModel)
            .filter(
                ZonaGranjaModel.id == zona_id,
                ZonaGranjaModel.empresa_id == empresa_id,
                ZonaGranjaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ZonaGranjaCreate) -> ZonaGranjaModel:
        reg = ZonaGranjaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            descripcion=data.descripcion,
            tipo=data.tipo,
            ubicacionGPS=data.ubicacionGPS,
            areaM2=data.areaM2,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ZonaGranjaModel, cambios: ZonaGranjaUpdate
    ) -> ZonaGranjaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ZonaGranjaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
