# backend/models/maternidad/Destete.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field


class DesteteMaternidad(Base):
  __tablename__ = "maternity_weanings"

  id = Column(Integer, primary_key=True, index=True)
  empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
  granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

  fecha = Column(Date, nullable=False)
  identificacion_madre = Column(String(50), nullable=False)
  lechones_destetados = Column(Integer, nullable=False)
  peso_total_kg = Column(Float, nullable=False)
  destino = Column(String(20), nullable=False)  # Engorde | Venta | Reposición | Otro
  responsable = Column(String(100), nullable=False)
  observaciones = Column(Text, nullable=True)

  created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
  updated_at = Column(
      DateTime,
      nullable=False,
      default=datetime.utcnow,
      onupdate=datetime.utcnow,
  )


# ===== Pydantic =====

class DesteteBase(BaseModel):
  empresa_id: int
  granja_id: int

  fecha: date
  identificacionMadre: str = Field(..., max_length=50, alias="identificacion_madre")
  lechonesDestetados: int = Field(..., alias="lechones_destetados")
  pesoTotalKg: float = Field(..., alias="peso_total_kg")
  destino: str
  responsable: str
  observaciones: Optional[str] = None

  class Config:
    populate_by_name = True


class DesteteCreate(DesteteBase):
  pass


class DesteteUpdate(BaseModel):
  fecha: Optional[date] = None
  identificacionMadre: Optional[str] = Field(None, max_length=50, alias="identificacion_madre")
  lechonesDestetados: Optional[int] = Field(None, alias="lechones_destetados")
  pesoTotalKg: Optional[float] = Field(None, alias="peso_total_kg")
  destino: Optional[str] = None
  responsable: Optional[str] = None
  observaciones: Optional[str] = None

  class Config:
    populate_by_name = True


class DesteteRead(DesteteBase):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True
    populate_by_name = True


# ===== Repositorio =====

class DesteteRepository:
  def __init__(self, db: Session):
    self.db = db

  def listar_por_granja(
      self, empresa_id: int, granja_id: int
  ) -> List[DesteteMaternidad]:
    return (
        self.db.query(DesteteMaternidad)
        .filter(
            DesteteMaternidad.empresa_id == empresa_id,
            DesteteMaternidad.granja_id == granja_id,
        )
        .order_by(DesteteMaternidad.fecha.desc())
        .all()
    )

  def obtener_por_id(
      self, destete_id: int, empresa_id: int, granja_id: int
  ) -> Optional[DesteteMaternidad]:
    return (
        self.db.query(DesteteMaternidad)
        .filter(
            DesteteMaternidad.id == destete_id,
            DesteteMaternidad.empresa_id == empresa_id,
            DesteteMaternidad.granja_id == granja_id,
        )
        .first()
    )

  def crear(self, data: DesteteCreate) -> DesteteMaternidad:
    destete = DesteteMaternidad(
        empresa_id=data.empresa_id,
        granja_id=data.granja_id,
        fecha=data.fecha,
        identificacion_madre=data.identificacionMadre,
        lechones_destetados=data.lechonesDestetados,
        peso_total_kg=data.pesoTotalKg,
        destino=data.destino,
        responsable=data.responsable,
        observaciones=data.observaciones,
    )
    self.db.add(destete)
    self.db.commit()
    self.db.refresh(destete)
    return destete

  def actualizar(
      self, destete: DesteteMaternidad, cambios: DesteteUpdate
  ) -> DesteteMaternidad:
    datos = cambios.dict(exclude_unset=True)
    for campo, valor in datos.items():
      if campo == "identificacionMadre":
        setattr(destete, "identificacion_madre", valor)
      elif campo == "lechonesDestetados":
        setattr(destete, "lechones_destetados", valor)
      elif campo == "pesoTotalKg":
        setattr(destete, "peso_total_kg", valor)
      else:
        setattr(destete, campo, valor)
    self.db.add(destete)
    self.db.commit()
    self.db.refresh(destete)
    return destete

  def eliminar(self, destete: DesteteMaternidad) -> None:
    self.db.delete(destete)
    self.db.commit()
