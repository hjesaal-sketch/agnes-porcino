# backend/models/sitio2/Reporte.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class ReporteSitio2Model(Base):
  __tablename__ = "sitio2_reportes"

  id = Column(Integer, primary_key=True, index=True)
  empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
  granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

  periodo = Column(String(7), nullable=False)
  ingresos = Column(Integer, nullable=False)
  bajas = Column(Integer, nullable=False)
  animales_vendidos = Column(Integer, nullable=False)
  peso_prom_venta = Column(Float, nullable=False)
  porcentaje_mortalidad = Column(Float, nullable=False)
  promedio_ganancia_diaria = Column(Float, nullable=False)
  ingresos_ventas = Column(Float, nullable=False)
  responsable = Column(String(120), nullable=False)

  created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
  updated_at = Column(
      DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
  )


class ReporteS2Base(BaseModel):
  empresa_id: int
  granja_id: int

  periodo: str
  ingresos: int
  bajas: int
  animales_vendidos: int
  peso_prom_venta: float
  porcentaje_mortalidad: float
  promedio_ganancia_diaria: float
  ingresos_ventas: float
  responsable: str


class ReporteS2Create(ReporteS2Base):
  pass


class ReporteS2Update(BaseModel):
  periodo: Optional[str] = None
  ingresos: Optional[int] = None
  bajas: Optional[int] = None
  animales_vendidos: Optional[int] = None
  peso_prom_venta: Optional[float] = None
  porcentaje_mortalidad: Optional[float] = None
  promedio_ganancia_diaria: Optional[float] = None
  ingresos_ventas: Optional[float] = None
  responsable: Optional[str] = None


class ReporteS2Read(ReporteS2Base):
  id: int
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True


class ReporteS2Repository:
  def __init__(self, db: Session):
    self.db = db

  def listar_por_granja(
      self, empresa_id: int, granja_id: int
  ) -> List[ReporteSitio2Model]:
    return (
        self.db.query(ReporteSitio2Model)
        .filter(
            ReporteSitio2Model.empresa_id == empresa_id,
            ReporteSitio2Model.granja_id == granja_id,
        )
        .order_by(ReporteSitio2Model.periodo.desc(), ReporteSitio2Model.id.desc())
        .all()
    )

  def obtener_por_id(
      self, rep_id: int, empresa_id: int, granja_id: int
  ) -> Optional[ReporteSitio2Model]:
    return (
        self.db.query(ReporteSitio2Model)
        .filter(
            ReporteSitio2Model.id == rep_id,
            ReporteSitio2Model.empresa_id == empresa_id,
            ReporteSitio2Model.granja_id == granja_id,
        )
        .first()
    )

  def crear(self, data: ReporteS2Create) -> ReporteSitio2Model:
    rep = ReporteSitio2Model(**data.dict())
    self.db.add(rep)
    self.db.commit()
    self.db.refresh(rep)
    return rep

  def actualizar(
      self, rep: ReporteSitio2Model, cambios: ReporteS2Update
  ) -> ReporteSitio2Model:
    datos = cambios.dict(exclude_unset=True)
    for campo, valor in datos.items():
      setattr(rep, campo, valor)
    self.db.add(rep)
    self.db.commit()
    self.db.refresh(rep)
    return rep

  def eliminar(self, rep: ReporteSitio2Model) -> None:
    self.db.delete(rep)
    self.db.commit()
