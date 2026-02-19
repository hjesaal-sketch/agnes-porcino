# backend/models/sitio3/Mortalidad.py
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


class MortalidadSitio3Model(Base):
    __tablename__ = "sitio3_mortalidad"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    lote = Column(String(80), nullable=False)
    corral = Column(String(80), nullable=False)
    cantidad = Column(Integer, nullable=False)
    causa = Column(Text, nullable=False)
    tipo = Column(String(40), nullable=False)  # Mortalidad / Descarte
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class MortalidadS3Base(BaseModel):
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


class MortalidadS3Create(MortalidadS3Base):
    pass


class MortalidadS3Update(BaseModel):
    fecha: Optional[date] = None
    lote: Optional[str] = None
    corral: Optional[str] = None
    cantidad: Optional[int] = Field(default=None, ge=0)
    causa: Optional[str] = None
    tipo: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class MortalidadS3Read(MortalidadS3Base):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MortalidadS3Repository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[MortalidadSitio3Model]:
        return (
            self.db.query(MortalidadSitio3Model)
            .filter(
                MortalidadSitio3Model.empresa_id == empresa_id,
                MortalidadSitio3Model.granja_id == granja_id,
            )
            .order_by(
                MortalidadSitio3Model.fecha.desc(),
                MortalidadSitio3Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MortalidadSitio3Model]:
        return (
            self.db.query(MortalidadSitio3Model)
            .filter(
                MortalidadSitio3Model.id == reg_id,
                MortalidadSitio3Model.empresa_id == empresa_id,
                MortalidadSitio3Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: MortalidadS3Create) -> MortalidadSitio3Model:
        reg = MortalidadSitio3Model(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: MortalidadSitio3Model, cambios: MortalidadS3Update
    ) -> MortalidadSitio3Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: MortalidadSitio3Model) -> None:
        self.db.delete(reg)
        self.db.commit()
