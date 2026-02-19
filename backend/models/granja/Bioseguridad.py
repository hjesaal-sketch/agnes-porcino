# backend/models/granja/Bioseguridad.py
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


class EventoBioseguridadModel(Base):
    __tablename__ = "farm_biosecurity_events"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    responsable = Column(String(120), nullable=False)
    acciones = Column(Text, nullable=True)
    estado = Column(String(20), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class EventoBioseguridadBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    tipo: str
    descripcion: str
    responsable: str
    acciones: str = ""
    estado: str
    observaciones: Optional[str] = None


class EventoBioseguridadCreate(EventoBioseguridadBase):
    pass


class EventoBioseguridadUpdate(BaseModel):
    fecha: Optional[date] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    acciones: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None


class EventoBioseguridadRead(EventoBioseguridadBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventoBioseguridadRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[EventoBioseguridadModel]:
        return (
            self.db.query(EventoBioseguridadModel)
            .filter(
                EventoBioseguridadModel.empresa_id == empresa_id,
                EventoBioseguridadModel.granja_id == granja_id,
            )
            .order_by(EventoBioseguridadModel.fecha.desc())
            .all()
        )

    def obtener_por_id(
        self, evento_id: int, empresa_id: int, granja_id: int
    ) -> Optional[EventoBioseguridadModel]:
        return (
            self.db.query(EventoBioseguridadModel)
            .filter(
                EventoBioseguridadModel.id == evento_id,
                EventoBioseguridadModel.empresa_id == empresa_id,
                EventoBioseguridadModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: EventoBioseguridadCreate) -> EventoBioseguridadModel:
        reg = EventoBioseguridadModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            tipo=data.tipo,
            descripcion=data.descripcion,
            responsable=data.responsable,
            acciones=data.acciones,
            estado=data.estado,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: EventoBioseguridadModel, cambios: EventoBioseguridadUpdate
    ) -> EventoBioseguridadModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: EventoBioseguridadModel) -> None:
        self.db.delete(reg)
        self.db.commit()
