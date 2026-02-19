# backend/models/sitio3/Crecimiento.py
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


class CrecimientoSitio3Model(Base):
  __tablename__ = "sitio3_crecimiento"

  id = Column(Integer, primary_key=True, index=True)
  empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
  granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

  fecha = Column(Date, nullable=False)
  lote = Column(String(80), nullable=False)
  corral = Column(String(80), nullable=False)
  cantidad_pesada = Column(Integer, nullable=False)
  peso_promedio = Column(Float, nullable=False)
  responsable = Column(String(120), nullable=False)
  observaciones = Column(Text, nullable=True)

  created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
  updated_at = Column(
      DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
  )


class CrecimientoS3Base(BaseModel):
  empresa_id: int
  granja_id: int

  fecha: date
  lote: str
  corral: str
  cantidad_pesada: int = Field(ge=0)
  peso_promedio: float = Field(ge=0)
  responsable: str
  observaciones: Optional[str] = None


class CrecimientoS3Create(CrecimientoS3Base):
  pass


class CrecimientoS3Update(BaseModel):
  fecha: Optional[date] = None
  lote: Optional[str] = None
  corral: Optional[str] = None
  cantidad_pesada: Optional[int] = Field(default=None, ge=0)
  peso_promedio: Optional[float] = Field(default=None, ge=0)
  responsable: Optional[str] = None
  observaciones: Optional[str] = None


class CrecimientoS3Read(CrecimientoS3Base):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class CrecimientoS3Repository:
  def __init__(self, db: Session):
    self.db = db

  def listar_por_granja(
      self, empresa_id: int, granja_id: int
  ) -> List[CrecimientoSitio3Model]:
    return (
        self.db.query(CrecimientoSitio3Model)
        .filter(
            CrecimientoSitio3Model.empresa_id == empresa_id,
            CrecimientoSitio3Model.granja_id == granja_id,
        )
        .order_by(
            CrecimientoSitio3Model.fecha.desc(),
            CrecimientoSitio3Model.id.desc(),
        )
        .all()
    )

  def obtener_por_id(
      self, reg_id: int, empresa_id: int, granja_id: int
  ) -> Optional[CrecimientoSitio3Model]:
    return (
        self.db.query(CrecimientoSitio3Model)
        .filter(
            CrecimientoSitio3Model.id == reg_id,
            CrecimientoSitio3Model.empresa_id == empresa_id,
            CrecimientoSitio3Model.granja_id == granja_id,
        )
        .first()
    )

  def crear(self, data: CrecimientoS3Create) -> CrecimientoSitio3Model:
    reg = CrecimientoSitio3Model(**data.dict())
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def actualizar(
      self, reg: CrecimientoSitio3Model, cambios: CrecimientoS3Update
  ) -> CrecimientoSitio3Model:
    datos = cambios.dict(exclude_unset=True)
    for campo, valor in datos.items():
      setattr(reg, campo, valor)
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def eliminar(self, reg: CrecimientoSitio3Model) -> None:
    self.db.delete(reg)
    self.db.commit()
