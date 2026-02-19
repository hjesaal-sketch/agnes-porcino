# backend/models/sitio2/Nutricion.py
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


class NutricionSitio2Model(Base):
    __tablename__ = "sitio2_nutricion"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    corral = Column(String(80), nullable=False)
    dieta = Column(String(120), nullable=False)
    alimento_consumido = Column(Float, nullable=False)
    suplemento = Column(String(120), nullable=False)
    cantidad_suplemento = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class NutricionBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    corral: str
    dieta: str
    alimento_consumido: float = Field(ge=0)
    suplemento: str
    cantidad_suplemento: float = Field(ge=0)
    responsable: str
    observaciones: Optional[str] = None


class NutricionCreate(NutricionBase):
    pass


class NutricionUpdate(BaseModel):
    fecha: Optional[date] = None
    corral: Optional[str] = None
    dieta: Optional[str] = None
    alimento_consumido: Optional[float] = Field(default=None, ge=0)
    suplemento: Optional[str] = None
    cantidad_suplemento: Optional[float] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class NutricionRead(NutricionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NutricionRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[NutricionSitio2Model]:
        return (
            self.db.query(NutricionSitio2Model)
            .filter(
                NutricionSitio2Model.empresa_id == empresa_id,
                NutricionSitio2Model.granja_id == granja_id,
            )
            .order_by(
                NutricionSitio2Model.fecha.desc(),
                NutricionSitio2Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[NutricionSitio2Model]:
        return (
            self.db.query(NutricionSitio2Model)
            .filter(
                NutricionSitio2Model.id == reg_id,
                NutricionSitio2Model.empresa_id == empresa_id,
                NutricionSitio2Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: NutricionCreate) -> NutricionSitio2Model:
        reg = NutricionSitio2Model(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            corral=data.corral,
            dieta=data.dieta,
            alimento_consumido=data.alimento_consumido,
            suplemento=data.suplemento,
            cantidad_suplemento=data.cantidad_suplemento,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: NutricionSitio2Model, cambios: NutricionUpdate
    ) -> NutricionSitio2Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: NutricionSitio2Model) -> None:
        self.db.delete(reg)
        self.db.commit()
