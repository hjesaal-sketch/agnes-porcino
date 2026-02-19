# backend/models/EconomicoCostos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class CostoEconomicoModel(Base):
    __tablename__ = "economico_costos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    categoria = Column(String(20), nullable=False)  # Fijo | Variable | Indirecto | Otro
    concepto = Column(String(200), nullable=False)
    monto = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)
    descripcion = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class CostoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    categoria: str = Field(pattern="^(Fijo|Variable|Indirecto|Otro)$")
    concepto: str
    monto: float = Field(gt=0)
    responsable: str
    descripcion: Optional[str] = ""


class CostoCreate(CostoBase):
    pass


class CostoUpdate(BaseModel):
    fecha: Optional[date] = None
    categoria: Optional[str] = Field(
        default=None, pattern="^(Fijo|Variable|Indirecto|Otro)$"
    )
    concepto: Optional[str] = None
    monto: Optional[float] = Field(default=None, gt=0)
    responsable: Optional[str] = None
    descripcion: Optional[str] = None


class CostoRead(CostoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CostoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self, empresa_id: int, granja_id: int
    ) -> List[CostoEconomicoModel]:
        return (
            self.db.query(CostoEconomicoModel)
            .filter(
                CostoEconomicoModel.empresa_id == empresa_id,
                CostoEconomicoModel.granja_id == granja_id,
            )
            .order_by(CostoEconomicoModel.fecha.desc(), CostoEconomicoModel.id.desc())
            .all()
        )

    def obtener(
        self, costo_id: int, empresa_id: int, granja_id: int
    ) -> Optional[CostoEconomicoModel]:
        return (
            self.db.query(CostoEconomicoModel)
            .filter(
                CostoEconomicoModel.id == costo_id,
                CostoEconomicoModel.empresa_id == empresa_id,
                CostoEconomicoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: CostoCreate) -> CostoEconomicoModel:
        reg = CostoEconomicoModel(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: CostoEconomicoModel, cambios: CostoUpdate
    ) -> CostoEconomicoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: CostoEconomicoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
