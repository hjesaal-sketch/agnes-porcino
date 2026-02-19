# backend/models/granja/Economico.py
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
    Float,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class MovimientoEconomicoModel(Base):
    __tablename__ = "farm_economic_movements"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(40), nullable=False)
    descripcion = Column(Text, nullable=False)
    categoria = Column(String(100), nullable=False)
    monto = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=True)
    comentarios = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ========= Pydantic =========

class MovimientoEconomicoBase(BaseModel):
    empresa_id: int
    granja_id: int
    fecha: date
    tipo: str          # "Costo fijo" | "Costo variable" | "Venta" | "Otro"
    descripcion: str
    categoria: str
    monto: float
    responsable: Optional[str] = None
    comentarios: Optional[str] = None


class MovimientoEconomicoCreate(MovimientoEconomicoBase):
    pass


class MovimientoEconomicoUpdate(BaseModel):
    fecha: Optional[date] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    monto: Optional[float] = None
    responsable: Optional[str] = None
    comentarios: Optional[str] = None


class MovimientoEconomicoRead(MovimientoEconomicoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========= Repositorio =========

class MovimientoEconomicoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[MovimientoEconomicoModel]:
        return (
            self.db.query(MovimientoEconomicoModel)
            .filter(
                MovimientoEconomicoModel.empresa_id == empresa_id,
                MovimientoEconomicoModel.granja_id == granja_id,
            )
            .order_by(
                MovimientoEconomicoModel.fecha.desc(),
                MovimientoEconomicoModel.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, mov_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MovimientoEconomicoModel]:
        return (
            self.db.query(MovimientoEconomicoModel)
            .filter(
                MovimientoEconomicoModel.id == mov_id,
                MovimientoEconomicoModel.empresa_id == empresa_id,
                MovimientoEconomicoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: MovimientoEconomicoCreate) -> MovimientoEconomicoModel:
        reg = MovimientoEconomicoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            tipo=data.tipo,
            descripcion=data.descripcion,
            categoria=data.categoria,
            monto=data.monto,
            responsable=data.responsable,
            comentarios=data.comentarios,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: MovimientoEconomicoModel, cambios: MovimientoEconomicoUpdate
    ) -> MovimientoEconomicoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: MovimientoEconomicoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
