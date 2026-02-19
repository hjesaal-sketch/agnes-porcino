# backend/models/granja/Instalaciones.py
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


class InstalacionGranjaModel(Base):
  __tablename__ = "farm_facilities"

  id = Column(Integer, primary_key=True, index=True)
  empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
  granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

  nombre = Column(String(120), nullable=False)
  tipo = Column(String(40), nullable=False)
  superficieM2 = Column(Float, nullable=False)
  capacidad = Column(String(120), nullable=False)
  estado = Column(String(30), nullable=False)
  descripcion = Column(Text, nullable=False)
  ubicacionZona = Column(String(120), nullable=False)
  observaciones = Column(Text, nullable=True)

  created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
  updated_at = Column(
      DateTime,
      nullable=False,
      default=datetime.utcnow,
      onupdate=datetime.utcnow,
  )


# ===== Pydantic =====

class InstalacionGranjaBase(BaseModel):
  empresa_id: int
  granja_id: int

  nombre: str
  tipo: str               # "Galpón" | "Depósito" | "Oficina" | "Corral" | "Enfermería" | "Otro"
  superficieM2: float = Field(ge=0)
  capacidad: str
  estado: str             # "Operativa" | "Mantenimiento" | "Inactiva"
  descripcion: str
  ubicacionZona: str
  observaciones: Optional[str] = None


class InstalacionGranjaCreate(InstalacionGranjaBase):
  pass


class InstalacionGranjaUpdate(BaseModel):
  nombre: Optional[str] = None
  tipo: Optional[str] = None
  superficieM2: Optional[float] = Field(default=None, ge=0)
  capacidad: Optional[str] = None
  estado: Optional[str] = None
  descripcion: Optional[str] = None
  ubicacionZona: Optional[str] = None
  observaciones: Optional[str] = None


class InstalacionGranjaRead(InstalacionGranjaBase):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


# ===== Repositorio =====

class InstalacionRepository:
  def __init__(self, db: Session):
    self.db = db

  def listar_por_granja(
      self, empresa_id: int, granja_id: int
  ) -> List[InstalacionGranjaModel]:
    return (
        self.db.query(InstalacionGranjaModel)
        .filter(
            InstalacionGranjaModel.empresa_id == empresa_id,
            InstalacionGranjaModel.granja_id == granja_id,
        )
        .order_by(InstalacionGranjaModel.nombre.asc())
        .all()
    )

  def obtener_por_id(
      self, inst_id: int, empresa_id: int, granja_id: int
  ) -> Optional[InstalacionGranjaModel]:
    return (
        self.db.query(InstalacionGranjaModel)
        .filter(
            InstalacionGranjaModel.id == inst_id,
            InstalacionGranjaModel.empresa_id == empresa_id,
            InstalacionGranjaModel.granja_id == granja_id,
        )
        .first()
    )

  def crear(self, data: InstalacionGranjaCreate) -> InstalacionGranjaModel:
    reg = InstalacionGranjaModel(
        empresa_id=data.empresa_id,
        granja_id=data.granja_id,
        nombre=data.nombre,
        tipo=data.tipo,
        superficieM2=data.superficieM2,
        capacidad=data.capacidad,
        estado=data.estado,
        descripcion=data.descripcion,
        ubicacionZona=data.ubicacionZona,
        observaciones=data.observaciones,
    )
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def actualizar(
      self, reg: InstalacionGranjaModel, cambios: InstalacionGranjaUpdate
  ) -> InstalacionGranjaModel:
    datos = cambios.dict(exclude_unset=True)
    for campo, valor in datos.items():
      setattr(reg, campo, valor)
    self.db.add(reg)
    self.db.commit()
    self.db.refresh(reg)
    return reg

  def eliminar(self, reg: InstalacionGranjaModel) -> None:
    self.db.delete(reg)
    self.db.commit()
