# backend/models/sitio3/Comercializacion.py
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


class ComercializacionSitio3Model(Base):
    __tablename__ = "sitio3_comercializacion"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    lote = Column(String(80), nullable=False)
    corral = Column(String(80), nullable=False)
    cantidad_vendida = Column(Integer, nullable=False)
    peso_promedio_venta = Column(Float, nullable=False)
    destino = Column(String(120), nullable=False)
    precio_unitario = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ComercializacionS3Base(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    lote: str
    corral: str
    cantidad_vendida: int = Field(ge=0)
    peso_promedio_venta: float = Field(ge=0)
    destino: str
    precio_unitario: float = Field(ge=0)
    responsable: str
    observaciones: Optional[str] = None


class ComercializacionS3Create(ComercializacionS3Base):
    pass


class ComercializacionS3Update(BaseModel):
    fecha: Optional[date] = None
    lote: Optional[str] = None
    corral: Optional[str] = None
    cantidad_vendida: Optional[int] = Field(default=None, ge=0)
    peso_promedio_venta: Optional[float] = Field(default=None, ge=0)
    destino: Optional[str] = None
    precio_unitario: Optional[float] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class ComercializacionS3Read(ComercializacionS3Base):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComercializacionS3Repository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ComercializacionSitio3Model]:
        return (
            self.db.query(ComercializacionSitio3Model)
            .filter(
                ComercializacionSitio3Model.empresa_id == empresa_id,
                ComercializacionSitio3Model.granja_id == granja_id,
            )
            .order_by(
                ComercializacionSitio3Model.fecha.desc(),
                ComercializacionSitio3Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ComercializacionSitio3Model]:
        return (
            self.db.query(ComercializacionSitio3Model)
            .filter(
                ComercializacionSitio3Model.id == reg_id,
                ComercializacionSitio3Model.empresa_id == empresa_id,
                ComercializacionSitio3Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ComercializacionS3Create) -> ComercializacionSitio3Model:
        reg = ComercializacionSitio3Model(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ComercializacionSitio3Model, cambios: ComercializacionS3Update
    ) -> ComercializacionSitio3Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ComercializacionSitio3Model) -> None:
        self.db.delete(reg)
        self.db.commit()
