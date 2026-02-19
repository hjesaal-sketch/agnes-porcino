# backend/models/granja/Entorno.py
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
)
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class EventoEntornoModel(Base):
    __tablename__ = "farm_environment_events"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    actores = Column(Text, nullable=False)
    impacto = Column(String(20), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ====== Pydantic ======

class EventoEntornoBase(BaseModel):
    empresa_id: int
    granja_id: int
    fecha: date
    tipo: str          # "Comunitario" | "Ambiental" | "Geográfico" | "Contexto legal" | "Otro"
    descripcion: str
    actores: str
    impacto: str       # "Positivo" | "Negativo" | "Neutro"
    observaciones: Optional[str] = None


class EventoEntornoCreate(EventoEntornoBase):
    pass


class EventoEntornoUpdate(BaseModel):
    fecha: Optional[date] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    actores: Optional[str] = None
    impacto: Optional[str] = None
    observaciones: Optional[str] = None


class EventoEntornoRead(EventoEntornoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ====== Repositorio ======

class EventoEntornoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[EventoEntornoModel]:
        return (
            self.db.query(EventoEntornoModel)
            .filter(
                EventoEntornoModel.empresa_id == empresa_id,
                EventoEntornoModel.granja_id == granja_id,
            )
            .order_by(
                EventoEntornoModel.fecha.desc(),
                EventoEntornoModel.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, evento_id: int, empresa_id: int, granja_id: int
    ) -> Optional[EventoEntornoModel]:
        return (
            self.db.query(EventoEntornoModel)
            .filter(
                EventoEntornoModel.id == evento_id,
                EventoEntornoModel.empresa_id == empresa_id,
                EventoEntornoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: EventoEntornoCreate) -> EventoEntornoModel:
        reg = EventoEntornoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            tipo=data.tipo,
            descripcion=data.descripcion,
            actores=data.actores,
            impacto=data.impacto,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: EventoEntornoModel, cambios: EventoEntornoUpdate
    ) -> EventoEntornoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: EventoEntornoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
