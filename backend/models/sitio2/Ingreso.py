# backend/models/sitio2/Ingreso.py
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


class IngresoSitio2Model(Base):
  __tablename__ = "sitio2_ingresos"

  id = Column(Integer, primary_key=True, index=True)
  empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
  granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

  fecha = Column(Date, nullable=False)
  lote = Column(String(80), nullable=False)
  cantidad = Column(Integer, nullable=False)
  peso_promedio = Column(Float, nullable=False)
  corral_destino = Column(String(80), nullable=False)
  proveedor = Column(String(80), nullable=False)
  responsable = Column(String(120), nullable=False)
  observaciones = Column(Text, nullable=True)

  created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
  updated_at = Column(
      DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
  )


class IngresoBase(BaseModel):
  empresa_id: int
  granja_id: int

  fecha: date
  lote: str
  cantidad: int = Field(ge=0)
  peso_promedio: float = Field(ge=0)
  corral_destino: str
  proveedor: str
  responsable: str
  observaciones: Optional[str] = None


class IngresoCreate(IngresoBase):
  pass


class IngresoUpdate(BaseModel):
  fecha: Optional[date] = None
  lote: Optional[str] = None
  cantidad: Optional[int] = Field(default=None, ge=0)
  peso_promedio: Optional[float] = Field(default=None, ge=0)
  corral_destino: Optional[str] = None
  proveedor: Optional[str] = None
  responsable: Optional[str] = None
  observaciones: Optional[str] = None


class IngresoRead(IngresoBase):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class IngresoRepository:
  def __init__(self, db: Session):
    self.db = db

  def listar_por_granja(
      self, empresa_id: int, granja_id: int
  ) -> List[IngresoSitio2Model]:
    return (
        self.db.query(IngresoSitio2Model)
        .filter(
            IngresoSitio2Model.empresa_id == empresa_id,
            IngresoSitio2Model.granja_id == granja_id,
        )
        .order_by(
            IngresoSitio2Model.fecha.desc(),
            IngresoSitio2Model.id.desc(),
        )
        .all()
    )

  def obtener_por_id(
      self, ingreso_id: int, empresa_id: int, granja_id: int
  ) -> Optional[IngresoSitio2Model]:
    return (
        self.db.query(IngresoSitio2Model)
        .filter(
            IngresoSitio2Model.id == ingreso_id,
            IngresoSitio2Model.empresa_id == empresa_id,
            IngresoSitio2Model.granja_id == granja_id,
        )
        .first()
    )

  def crear(self, data: IngresoCreate) -> IngresoSitio2Model:
    reg = IngresoSitio2Model(
        empresa_id=data.empresa_id,
        granja_id=data.granja_id,
        fecha=data.fecha,
        lote=data.lote,
        cantidad=data.cantidad,
        peso_promedio=data.peso_promedio,
        corral_destino=data.corral_destino,
        proveedor=data.proveedor,
        responsable=data.responsable,
        observaciones=data.observaciones,
    )
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def actualizar(
      self, reg: IngresoSitio2Model, cambios: IngresoUpdate
  ) -> IngresoSitio2Model:
    datos = cambios.dict(exclude_unset=True)
    for campo, valor in datos.items():
      setattr(reg, campo, valor)
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def eliminar(self, reg: IngresoSitio2Model) -> None:
    self.db.delete(reg)
    self.db.commit()
