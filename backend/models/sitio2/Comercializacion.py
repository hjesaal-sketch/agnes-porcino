# backend/models/sitio2/Comercializacion.py
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
    Float,
    ForeignKey,
)
from sqlalchemy.orm import Session

from pydantic import BaseModel, Field

from backend.database import Base


class ComercializacionSitio2Model(Base):
    __tablename__ = "sitio2_comercializacion"

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


class ComercializacionBase(BaseModel):
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


class ComercializacionCreate(ComercializacionBase):
    pass


class ComercializacionUpdate(BaseModel):
    fecha: Optional[date] = None
    lote: Optional[str] = None
    corral: Optional[str] = None
    cantidad_vendida: Optional[int] = Field(default=None, ge=0)
    peso_promedio_venta: Optional[float] = Field(default=None, ge=0)
    destino: Optional[str] = None
    precio_unitario: Optional[float] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class ComercializacionRead(ComercializacionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComercializacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ComercializacionSitio2Model]:
        return (
            self.db.query(ComercializacionSitio2Model)
            .filter(
                ComercializacionSitio2Model.empresa_id == empresa_id,
                ComercializacionSitio2Model.granja_id == granja_id,
            )
            .order_by(
                ComercializacionSitio2Model.fecha.desc(),
                ComercializacionSitio2Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, venta_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ComercializacionSitio2Model]:
        return (
            self.db.query(ComercializacionSitio2Model)
            .filter(
                ComercializacionSitio2Model.id == venta_id,
                ComercializacionSitio2Model.empresa_id == empresa_id,
                ComercializacionSitio2Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ComercializacionCreate) -> ComercializacionSitio2Model:
        reg = ComercializacionSitio2Model(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            lote=data.lote,
            corral=data.corral,
            cantidad_vendida=data.cantidad_vendida,
            peso_promedio_venta=data.peso_promedio_venta,
            destino=data.destino,
            precio_unitario=data.precio_unitario,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ComercializacionSitio2Model, cambios: ComercializacionUpdate
    ) -> ComercializacionSitio2Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ComercializacionSitio2Model) -> None:
        self.db.delete(reg)
        self.db.commit()
