# backend/models/reportes/Costos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class CostoIndicadorModel(Base):
    __tablename__ = "reportes_costos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(7), nullable=False)  # "YYYY-MM"
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    costos_fijos = Column(Float, nullable=False)
    costos_variables = Column(Float, nullable=False)
    extraordinarios = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class CostoIndicadorBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str  # "YYYY-MM"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    costos_fijos: float
    costos_variables: float
    extraordinarios: float
    total: float
    responsable: str


class CostoIndicadorCreate(CostoIndicadorBase):
    pass


class CostoIndicadorRead(CostoIndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CostoIndicadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        periodo: Optional[str] = None,
    ) -> List[CostoIndicadorModel]:
        q = (
            self.db.query(CostoIndicadorModel)
            .filter(
                CostoIndicadorModel.empresa_id == empresa_id,
                CostoIndicadorModel.granja_id == granja_id,
            )
        )
        if periodo:
            q = q.filter(CostoIndicadorModel.periodo == periodo)
        return (
            q.order_by(
                CostoIndicadorModel.periodo.desc(),
                CostoIndicadorModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: CostoIndicadorCreate) -> CostoIndicadorModel:
        reg = CostoIndicadorModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            costos_fijos=data.costos_fijos,
            costos_variables=data.costos_variables,
            extraordinarios=data.extraordinarios,
            total=data.total,
            responsable=data.responsable,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
