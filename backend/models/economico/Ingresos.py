# backend/models/economico/Ingresos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class IngresoEconomicoModel(Base):
    __tablename__ = "economico_ingresos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    fuente = Column(String(200), nullable=False)
    tipo = Column(
        String(40), nullable=False
    )  # "Venta producción" | "Subvención" | "Préstamo" | "Otro"
    monto = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)
    descripcion = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class IngresoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    fuente: str
    tipo: str = Field(
        pattern="^(Venta producción|Subvención|Préstamo|Otro)$"
    )
    monto: float = Field(gt=0)
    responsable: str
    descripcion: Optional[str] = ""


class IngresoCreate(IngresoBase):
    pass


class IngresoUpdate(BaseModel):
    fecha: Optional[date] = None
    fuente: Optional[str] = None
    tipo: Optional[str] = Field(
        default=None,
        pattern="^(Venta producción|Subvención|Préstamo|Otro)$",
    )
    monto: Optional[float] = Field(default=None, gt=0)
    responsable: Optional[str] = None
    descripcion: Optional[str] = None


class IngresoRead(IngresoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IngresoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self, empresa_id: int, granja_id: int
    ) -> List[IngresoEconomicoModel]:
        return (
            self.db.query(IngresoEconomicoModel)
            .filter(
                IngresoEconomicoModel.empresa_id == empresa_id,
                IngresoEconomicoModel.granja_id == granja_id,
            )
            .order_by(
                IngresoEconomicoModel.fecha.desc(),
                IngresoEconomicoModel.id.desc(),
            )
            .all()
        )

    def obtener(
        self, ingreso_id: int, empresa_id: int, granja_id: int
    ) -> Optional[IngresoEconomicoModel]:
        return (
            self.db.query(IngresoEconomicoModel)
            .filter(
                IngresoEconomicoModel.id == ingreso_id,
                IngresoEconomicoModel.empresa_id == empresa_id,
                IngresoEconomicoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: IngresoCreate) -> IngresoEconomicoModel:
        reg = IngresoEconomicoModel(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: IngresoEconomicoModel, cambios: IngresoUpdate
    ) -> IngresoEconomicoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: IngresoEconomicoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
