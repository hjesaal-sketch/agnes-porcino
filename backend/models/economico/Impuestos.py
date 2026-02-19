# backend/models/economico/Impuestos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class ImpuestoEconomicoModel(Base):
    __tablename__ = "economico_impuestos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(20), nullable=False)  # IVA | ISLR | Arancel | Otro
    monto = Column(Float, nullable=False)
    descripcion = Column(String(500), nullable=True)
    pagado = Column(Boolean, nullable=False, default=False)
    vencimiento = Column(Date, nullable=False)
    responsable = Column(String(120), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ImpuestoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    tipo: str = Field(pattern="^(IVA|ISLR|Arancel|Otro)$")
    monto: float = Field(gt=0)
    descripcion: Optional[str] = ""
    pagado: bool = False
    vencimiento: date
    responsable: str


class ImpuestoCreate(ImpuestoBase):
    pass


class ImpuestoUpdate(BaseModel):
    fecha: Optional[date] = None
    tipo: Optional[str] = Field(
        default=None, pattern="^(IVA|ISLR|Arancel|Otro)$"
    )
    monto: Optional[float] = Field(default=None, gt=0)
    descripcion: Optional[str] = None
    pagado: Optional[bool] = None
    vencimiento: Optional[date] = None
    responsable: Optional[str] = None


class ImpuestoRead(ImpuestoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ImpuestoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self, empresa_id: int, granja_id: int
    ) -> List[ImpuestoEconomicoModel]:
        return (
            self.db.query(ImpuestoEconomicoModel)
            .filter(
                ImpuestoEconomicoModel.empresa_id == empresa_id,
                ImpuestoEconomicoModel.granja_id == granja_id,
            )
            .order_by(
                ImpuestoEconomicoModel.fecha.desc(),
                ImpuestoEconomicoModel.id.desc(),
            )
            .all()
        )

    def obtener(
        self, imp_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ImpuestoEconomicoModel]:
        return (
            self.db.query(ImpuestoEconomicoModel)
            .filter(
                ImpuestoEconomicoModel.id == imp_id,
                ImpuestoEconomicoModel.empresa_id == empresa_id,
                ImpuestoEconomicoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ImpuestoCreate) -> ImpuestoEconomicoModel:
        reg = ImpuestoEconomicoModel(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ImpuestoEconomicoModel, cambios: ImpuestoUpdate
    ) -> ImpuestoEconomicoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ImpuestoEconomicoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
