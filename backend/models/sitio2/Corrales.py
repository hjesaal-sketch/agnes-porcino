# backend/models/sitio2/Corrales.py
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


class CorralSitio2Model(Base):
    __tablename__ = "sitio2_corrales"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    codigo = Column(String(50), nullable=False)
    tipo = Column(String(30), nullable=False)
    capacidad = Column(Integer, nullable=False)
    ocupacion_actual = Column(Integer, nullable=False)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class CorralBase(BaseModel):
    empresa_id: int
    granja_id: int

    codigo: str
    tipo: str  # "Engorde" | "Recría" | "Cuarentena"
    capacidad: int = Field(ge=0)
    ocupacion_actual: int = Field(ge=0)
    responsable: str
    observaciones: Optional[str] = None


class CorralCreate(CorralBase):
    pass


class CorralUpdate(BaseModel):
    codigo: Optional[str] = None
    tipo: Optional[str] = None
    capacidad: Optional[int] = Field(default=None, ge=0)
    ocupacion_actual: Optional[int] = Field(default=None, ge=0)
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class CorralRead(CorralBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CorralesRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[CorralSitio2Model]:
        return (
            self.db.query(CorralSitio2Model)
            .filter(
                CorralSitio2Model.empresa_id == empresa_id,
                CorralSitio2Model.granja_id == granja_id,
            )
            .order_by(CorralSitio2Model.codigo.asc())
            .all()
        )

    def obtener_por_id(
        self, corral_id: int, empresa_id: int, granja_id: int
    ) -> Optional[CorralSitio2Model]:
        return (
            self.db.query(CorralSitio2Model)
            .filter(
                CorralSitio2Model.id == corral_id,
                CorralSitio2Model.empresa_id == empresa_id,
                CorralSitio2Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: CorralCreate) -> CorralSitio2Model:
        reg = CorralSitio2Model(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            codigo=data.codigo,
            tipo=data.tipo,
            capacidad=data.capacidad,
            ocupacion_actual=data.ocupacion_actual,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: CorralSitio2Model, cambios: CorralUpdate
    ) -> CorralSitio2Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: CorralSitio2Model) -> None:
        self.db.delete(reg)
        self.db.commit()
