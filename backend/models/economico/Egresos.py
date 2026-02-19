# backend/models/economico/Egresos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class EgresoEconomicoModel(Base):
    __tablename__ = "economico_egresos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    beneficiario = Column(String(200), nullable=False)
    tipo = Column(
        String(40), nullable=False
    )  # "Compra insumos" | "Pago servicios" | "Salarios" | "Otro"
    monto = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)
    descripcion = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class EgresoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    beneficiario: str
    tipo: str = Field(
        pattern="^(Compra insumos|Pago servicios|Salarios|Otro)$"
    )
    monto: float = Field(gt=0)
    responsable: str
    descripcion: Optional[str] = ""


class EgresoCreate(EgresoBase):
    pass


class EgresoUpdate(BaseModel):
    fecha: Optional[date] = None
    beneficiario: Optional[str] = None
    tipo: Optional[str] = Field(
        default=None,
        pattern="^(Compra insumos|Pago servicios|Salarios|Otro)$",
    )
    monto: Optional[float] = Field(default=None, gt=0)
    responsable: Optional[str] = None
    descripcion: Optional[str] = None


class EgresoRead(EgresoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EgresoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self, empresa_id: int, granja_id: int
    ) -> List[EgresoEconomicoModel]:
        return (
            self.db.query(EgresoEconomicoModel)
            .filter(
                EgresoEconomicoModel.empresa_id == empresa_id,
                EgresoEconomicoModel.granja_id == granja_id,
            )
            .order_by(EgresoEconomicoModel.fecha.desc(), EgresoEconomicoModel.id.desc())
            .all()
        )

    def obtener(
        self, egreso_id: int, empresa_id: int, granja_id: int
    ) -> Optional[EgresoEconomicoModel]:
        return (
            self.db.query(EgresoEconomicoModel)
            .filter(
                EgresoEconomicoModel.id == egreso_id,
                EgresoEconomicoModel.empresa_id == empresa_id,
                EgresoEconomicoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: EgresoCreate) -> EgresoEconomicoModel:
        reg = EgresoEconomicoModel(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: EgresoEconomicoModel, cambios: EgresoUpdate
    ) -> EgresoEconomicoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: EgresoEconomicoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
