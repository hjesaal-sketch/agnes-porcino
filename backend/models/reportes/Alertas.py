# backend/models/reportes/Alertas.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class AlertaModel(Base):
    __tablename__ = "reportes_alertas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(50), nullable=False)  # Sanidad, Productividad, Bioseguridad, Costos, Infraestructura, Otro
    nivel = Column(String(50), nullable=False)  # Crítico, Precaución, Informativo
    descripcion = Column(String(500), nullable=False)
    responsable = Column(String(120), nullable=False)
    cerrado = Column(Boolean, nullable=False, default=False)
    acciones = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class AlertaBase(BaseModel):
    empresa_id: int
    granja_id: int
    fecha: date
    tipo: str  # Sanidad, Productividad, Bioseguridad, Costos, Infraestructura, Otro
    nivel: str  # Crítico, Precaución, Informativo
    descripcion: str
    responsable: str
    cerrado: bool = False
    acciones: Optional[str] = None


class AlertaCreate(AlertaBase):
    pass


class AlertaUpdate(BaseModel):
    tipo: Optional[str] = None
    nivel: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    cerrado: Optional[bool] = None
    acciones: Optional[str] = None


class AlertaRead(AlertaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        tipo: Optional[str] = None,
        solo_abiertas: bool = False,
    ) -> List[AlertaModel]:
        q = (
            self.db.query(AlertaModel)
            .filter(
                AlertaModel.empresa_id == empresa_id,
                AlertaModel.granja_id == granja_id,
            )
        )
        if tipo:
            q = q.filter(AlertaModel.tipo == tipo)
        if solo_abiertas:
            q = q.filter(AlertaModel.cerrado == False)
        return (
            q.order_by(
                AlertaModel.fecha.desc(),
                AlertaModel.id.desc(),
            )
            .all()
        )

    def crear(self, data: AlertaCreate) -> AlertaModel:
        reg = AlertaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            tipo=data.tipo,
            nivel=data.nivel,
            descripcion=data.descripcion,
            responsable=data.responsable,
            cerrado=data.cerrado,
            acciones=data.acciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(self, alerta_id: int, data: AlertaUpdate) -> AlertaModel:
        reg = self.db.query(AlertaModel).filter(AlertaModel.id == alerta_id).first()
        if not reg:
            return None
        for key, value in data.dict(exclude_unset=True).items():
            setattr(reg, key, value)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def obtener_por_id(self, alerta_id: int) -> AlertaModel:
        return self.db.query(AlertaModel).filter(AlertaModel.id == alerta_id).first()
