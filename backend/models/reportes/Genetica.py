# backend/models/reportes/Genetica.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class GeneticaIndicadorModel(Base):
    __tablename__ = "reportes_genetica"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(7), nullable=False)  # "YYYY-MM"
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    linea = Column(String(120), nullable=False)
    animales = Column(Integer, nullable=False)
    nacimientos = Column(Integer, nullable=False)
    selectos = Column(Integer, nullable=False)
    descarte = Column(Integer, nullable=False)
    progreso_gen = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class GeneticaIndicadorBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str  # "YYYY-MM"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    linea: str
    animales: int
    nacimientos: int
    selectos: int
    descarte: int
    progreso_gen: float
    responsable: str


class GeneticaIndicadorCreate(GeneticaIndicadorBase):
    pass


class GeneticaIndicadorRead(GeneticaIndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GeneticaIndicadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        periodo: Optional[str] = None,
    ) -> List[GeneticaIndicadorModel]:
        q = (
            self.db.query(GeneticaIndicadorModel)
            .filter(
                GeneticaIndicadorModel.empresa_id == empresa_id,
                GeneticaIndicadorModel.granja_id == granja_id,
            )
        )
        if periodo:
            q = q.filter(GeneticaIndicadorModel.periodo == periodo)
        return (
            q.order_by(
                GeneticaIndicadorModel.periodo.desc(),
                GeneticaIndicadorModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: GeneticaIndicadorCreate) -> GeneticaIndicadorModel:
        reg = GeneticaIndicadorModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            linea=data.linea,
            animales=data.animales,
            nacimientos=data.nacimientos,
            selectos=data.selectos,
            descarte=data.descarte,
            progreso_gen=data.progreso_gen,
            responsable=data.responsable,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
