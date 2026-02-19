# backend/models/sitio2/Mortalidad.py
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
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import Base


class MortalidadSitio2Model(Base):
    __tablename__ = "sitio2_mortalidad"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    lote = Column(String(80), nullable=False)
    corral = Column(String(80), nullable=False)
    cantidad = Column(Integer, nullable=False)
    causa = Column(String(120), nullable=False)
    tipo = Column(String(30), nullable=False)  # Mortalidad | Descarte
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class MortalidadBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    lote: str
    corral: str
    cantidad: int = Field(ge=0)
    causa: str
    tipo: str
    responsable: str
    observaciones: Optional[str] = None


class MortalidadCreate(MortalidadBase):
    pass


class MortalidadUpdate(BaseModel):
    fecha: Optional[date] = None
    lote: Optional[str] = None
    corral: Optional[str] = None
    cantidad: Optional[int] = Field(default=None, ge=0)
    causa: Optional[str] = None
    tipo: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class MortalidadRead(MortalidadBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MortalidadRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[MortalidadSitio2Model]:
        return (
            self.db.query(MortalidadSitio2Model)
            .filter(
                MortalidadSitio2Model.empresa_id == empresa_id,
                MortalidadSitio2Model.granja_id == granja_id,
            )
            .order_by(
                MortalidadSitio2Model.fecha.desc(),
                MortalidadSitio2Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MortalidadSitio2Model]:
        return (
            self.db.query(MortalidadSitio2Model)
            .filter(
                MortalidadSitio2Model.id == reg_id,
                MortalidadSitio2Model.empresa_id == empresa_id,
                MortalidadSitio2Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: MortalidadCreate) -> MortalidadSitio2Model:
        reg = MortalidadSitio2Model(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            lote=data.lote,
            corral=data.corral,
            cantidad=data.cantidad,
            causa=data.causa,
            tipo=data.tipo,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: MortalidadSitio2Model, cambios: MortalidadUpdate
    ) -> MortalidadSitio2Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: MortalidadSitio2Model) -> None:
        self.db.delete(reg)
        self.db.commit()
