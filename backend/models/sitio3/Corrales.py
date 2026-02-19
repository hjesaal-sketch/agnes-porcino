# backend/models/sitio3/Corrales.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class CorralSitio3Model(Base):
    __tablename__ = "sitio3_corrales"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    codigo = Column(String(80), nullable=False)
    tipo = Column(String(40), nullable=False)
    capacidad = Column(Integer, nullable=False)
    ocupacion_actual = Column(Integer, nullable=False, default=0)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class CorralS3Base(BaseModel):
    empresa_id: int
    granja_id: int

    codigo: str
    tipo: str
    capacidad: int = Field(ge=0)
    ocupacion_actual: int = Field(ge=0)
    responsable: str
    observaciones: Optional[str] = None


class CorralS3Create(CorralS3Base):
    pass


class CorralS3Update(BaseModel):
    codigo: Optional[str] = None
    tipo: Optional[str] = None
    capacidad: Optional[int] = Field(default=None, ge=0)
    ocupacion_actual: Optional[int] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class CorralS3Read(CorralS3Base):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CorralS3Repository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[CorralSitio3Model]:
        return (
            self.db.query(CorralSitio3Model)
            .filter(
                CorralSitio3Model.empresa_id == empresa_id,
                CorralSitio3Model.granja_id == granja_id,
            )
            .order_by(CorralSitio3Model.codigo.asc())
            .all()
        )

    def obtener_por_id(
        self, corral_id: int, empresa_id: int, granja_id: int
    ) -> Optional[CorralSitio3Model]:
        return (
            self.db.query(CorralSitio3Model)
            .filter(
                CorralSitio3Model.id == corral_id,
                CorralSitio3Model.empresa_id == empresa_id,
                CorralSitio3Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: CorralS3Create) -> CorralSitio3Model:
        corral = CorralSitio3Model(**data.dict())
        self.db.add(corral)
        self.db.commit()
        self.db.refresh(corral)
        return corral

    def actualizar(
        self, corral: CorralSitio3Model, cambios: CorralS3Update
    ) -> CorralSitio3Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(corral, campo, valor)
        self.db.add(corral)
        self.db.commit()
        self.db.refresh(corral)
        return corral

    def eliminar(self, corral: CorralSitio3Model) -> None:
        self.db.delete(corral)
        self.db.commit()
