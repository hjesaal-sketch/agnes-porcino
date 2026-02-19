# backend/models/reportes/Nutricion.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class NutricionIndicadorModel(Base):
    __tablename__ = "reportes_nutricion"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(7), nullable=False)  # "YYYY-MM"
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    consumo_total_kg = Column(Float, nullable=False)
    consumo_prom_animal = Column(Float, nullable=False)
    costo_total = Column(Float, nullable=False)
    costo_prom_animal = Column(Float, nullable=False)
    eficiencia = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class NutricionIndicadorBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str  # "YYYY-MM"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    consumo_total_kg: float
    consumo_prom_animal: float
    costo_total: float
    costo_prom_animal: float
    eficiencia: float
    responsable: str


class NutricionIndicadorCreate(NutricionIndicadorBase):
    pass


class NutricionIndicadorRead(NutricionIndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NutricionIndicadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        periodo: Optional[str] = None,
    ) -> List[NutricionIndicadorModel]:
        q = (
            self.db.query(NutricionIndicadorModel)
            .filter(
                NutricionIndicadorModel.empresa_id == empresa_id,
                NutricionIndicadorModel.granja_id == granja_id,
            )
        )
        if periodo:
            q = q.filter(NutricionIndicadorModel.periodo == periodo)
        return (
            q.order_by(
                NutricionIndicadorModel.periodo.desc(),
                NutricionIndicadorModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: NutricionIndicadorCreate) -> NutricionIndicadorModel:
        reg = NutricionIndicadorModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            consumo_total_kg=data.consumo_total_kg,
            consumo_prom_animal=data.consumo_prom_animal,
            costo_total=data.costo_total,
            costo_prom_animal=data.costo_prom_animal,
            eficiencia=data.eficiencia,
            responsable=data.responsable,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
