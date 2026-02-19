# backend/models/granja/Servicios.py
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
from pydantic import BaseModel, Field

from backend.database import Base


class ServicioGranjaModel(Base):
    __tablename__ = "farm_services"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    tipo = Column(String(40), nullable=False)
    fuente = Column(String(120), nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(40), nullable=False)
    fecha = Column(Date, nullable=False)
    estado = Column(String(30), nullable=False)
    descripcion = Column(Text, nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ===== Pydantic =====

class ServicioGranjaBase(BaseModel):
    empresa_id: int
    granja_id: int

    tipo: str          # "Agua" | "Electricidad" | "Residuos" | "Gas" | "Internet" | "Otro"
    fuente: str
    cantidad: float = Field(ge=0)
    unidad: str
    fecha: date
    estado: str        # "Operativo" | "Interrumpido" | "Mantenimiento"
    descripcion: str
    observaciones: Optional[str] = None


class ServicioGranjaCreate(ServicioGranjaBase):
    pass


class ServicioGranjaUpdate(BaseModel):
    tipo: Optional[str] = None
    fuente: Optional[str] = None
    cantidad: Optional[float] = Field(default=None, ge=0)
    unidad: Optional[str] = None
    fecha: Optional[date] = None
    estado: Optional[str] = None
    descripcion: Optional[str] = None
    observaciones: Optional[str] = None


class ServicioGranjaRead(ServicioGranjaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====

class ServicioRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ServicioGranjaModel]:
        return (
            self.db.query(ServicioGranjaModel)
            .filter(
                ServicioGranjaModel.empresa_id == empresa_id,
                ServicioGranjaModel.granja_id == granja_id,
            )
            .order_by(ServicioGranjaModel.fecha.desc(), ServicioGranjaModel.id.desc())
            .all()
        )

    def obtener_por_id(
        self, serv_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ServicioGranjaModel]:
        return (
            self.db.query(ServicioGranjaModel)
            .filter(
                ServicioGranjaModel.id == serv_id,
                ServicioGranjaModel.empresa_id == empresa_id,
                ServicioGranjaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ServicioGranjaCreate) -> ServicioGranjaModel:
        reg = ServicioGranjaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            tipo=data.tipo,
            fuente=data.fuente,
            cantidad=data.cantidad,
            unidad=data.unidad,
            fecha=data.fecha,
            estado=data.estado,
            descripcion=data.descripcion,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ServicioGranjaModel, cambios: ServicioGranjaUpdate
    ) -> ServicioGranjaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ServicioGranjaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
