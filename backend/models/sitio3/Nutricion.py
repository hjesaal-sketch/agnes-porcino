# backend/models/sitio3/Nutricion.py
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


class NutricionSitio3Model(Base):
    __tablename__ = "sitio3_nutricion"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    corral = Column(String(80), nullable=False)
    lote = Column(String(80), nullable=False)
    dieta = Column(String(120), nullable=False)
    alimento_consumido = Column(Float, nullable=False)
    suplemento = Column(String(120), nullable=False, default="")
    cantidad_suplemento = Column(Float, nullable=False, default=0)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class NutricionS3Base(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    corral: str
    lote: str
    dieta: str
    alimento_consumido: float = Field(ge=0)
    suplemento: str
    cantidad_suplemento: float = Field(ge=0)
    responsable: str
    observaciones: Optional[str] = None


class NutricionS3Create(NutricionS3Base):
    pass


class NutricionS3Update(BaseModel):
    fecha: Optional[date] = None
    corral: Optional[str] = None
    lote: Optional[str] = None
    dieta: Optional[str] = None
    alimento_consumido: Optional[float] = Field(default=None, ge=0)
    suplemento: Optional[str] = None
    cantidad_suplemento: Optional[float] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class NutricionS3Read(NutricionS3Base):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NutricionS3Repository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[NutricionSitio3Model]:
        return (
            self.db.query(NutricionSitio3Model)
            .filter(
                NutricionSitio3Model.empresa_id == empresa_id,
                NutricionSitio3Model.granja_id == granja_id,
            )
            .order_by(
                NutricionSitio3Model.fecha.desc(),
                NutricionSitio3Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[NutricionSitio3Model]:
        return (
            self.db.query(NutricionSitio3Model)
            .filter(
                NutricionSitio3Model.id == reg_id,
                NutricionSitio3Model.empresa_id == empresa_id,
                NutricionSitio3Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: NutricionS3Create) -> NutricionSitio3Model:
        reg = NutricionSitio3Model(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: NutricionSitio3Model, cambios: NutricionS3Update
    ) -> NutricionSitio3Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: NutricionSitio3Model) -> None:
        self.db.delete(reg)
        self.db.commit()
