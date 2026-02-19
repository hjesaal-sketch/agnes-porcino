# backend/models/reportes/Productividad.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class ProdIndicadorModel(Base):
    __tablename__ = "reportes_productividad"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(7), nullable=False)  # "YYYY-MM"
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    animales_activos = Column(Integer, nullable=False)
    kg_productos = Column(Float, nullable=False)
    kg_prom_dia = Column(Float, nullable=False)
    eficiencia = Column(Float, nullable=False)
    conversion = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class ProdIndicadorBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str  # "YYYY-MM"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    animales_activos: int
    kg_productos: float
    kg_prom_dia: float
    eficiencia: float
    conversion: float
    responsable: str


class ProdIndicadorCreate(ProdIndicadorBase):
    pass


class ProdIndicadorRead(ProdIndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProdIndicadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        periodo: Optional[str] = None,
    ) -> List[ProdIndicadorModel]:
        q = (
            self.db.query(ProdIndicadorModel)
            .filter(
                ProdIndicadorModel.empresa_id == empresa_id,
                ProdIndicadorModel.granja_id == granja_id,
            )
        )
        if periodo:
            q = q.filter(ProdIndicadorModel.periodo == periodo)
        return (
            q.order_by(
                ProdIndicadorModel.periodo.desc(),
                ProdIndicadorModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: ProdIndicadorCreate) -> ProdIndicadorModel:
        reg = ProdIndicadorModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            animales_activos=data.animales_activos,
            kg_productos=data.kg_productos,
            kg_prom_dia=data.kg_prom_dia,
            eficiencia=data.eficiencia,
            conversion=data.conversion,
            responsable=data.responsable,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
