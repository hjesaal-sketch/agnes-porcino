# backend/models/reportes/Sanidad.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class SanidadIndicadorModel(Base):
    __tablename__ = "reportes_sanidad"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(7), nullable=False)  # "YYYY-MM"
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    eventos = Column(Integer, nullable=False)
    baja_enf = Column(Integer, nullable=False)
    tratamientos = Column(Integer, nullable=False)
    vacunaciones = Column(Integer, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class SanidadIndicadorBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str  # "YYYY-MM"
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    eventos: int
    baja_enf: int
    tratamientos: int
    vacunaciones: int
    responsable: str


class SanidadIndicadorCreate(SanidadIndicadorBase):
    pass


class SanidadIndicadorRead(SanidadIndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SanidadIndicadorRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        periodo: Optional[str] = None,
    ) -> List[SanidadIndicadorModel]:
        q = (
            self.db.query(SanidadIndicadorModel)
            .filter(
                SanidadIndicadorModel.empresa_id == empresa_id,
                SanidadIndicadorModel.granja_id == granja_id,
            )
        )
        if periodo:
            q = q.filter(SanidadIndicadorModel.periodo == periodo)
        return (
            q.order_by(
                SanidadIndicadorModel.periodo.desc(),
                SanidadIndicadorModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: SanidadIndicadorCreate) -> SanidadIndicadorModel:
        reg = SanidadIndicadorModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            fecha_inicio=data.fecha_inicio,
            fecha_fin=data.fecha_fin,
            eventos=data.eventos,
            baja_enf=data.baja_enf,
            tratamientos=data.tratamientos,
            vacunaciones=data.vacunaciones,
            responsable=data.responsable,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
