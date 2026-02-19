# backend/models/sitio3/SaludBienestar.py
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
from pydantic import BaseModel

from backend.database import Base


class SaludSitio3Model(Base):
    __tablename__ = "sitio3_salud"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    corral = Column(String(80), nullable=False)
    lote = Column(String(80), nullable=False)
    evento = Column(Text, nullable=False)
    tratamiento = Column(Text, nullable=False)
    responsable = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class SaludS3Base(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    corral: str
    lote: str
    evento: str
    tratamiento: str
    responsable: str
    observaciones: Optional[str] = None


class SaludS3Create(SaludS3Base):
    pass


class SaludS3Update(BaseModel):
    fecha: Optional[date] = None
    corral: Optional[str] = None
    lote: Optional[str] = None
    evento: Optional[str] = None
    tratamiento: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class SaludS3Read(SaludS3Base):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SaludS3Repository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[SaludSitio3Model]:
        return (
            self.db.query(SaludSitio3Model)
            .filter(
                SaludSitio3Model.empresa_id == empresa_id,
                SaludSitio3Model.granja_id == granja_id,
            )
            .order_by(
                SaludSitio3Model.fecha.desc(),
                SaludSitio3Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[SaludSitio3Model]:
        return (
            self.db.query(SaludSitio3Model)
            .filter(
                SaludSitio3Model.id == reg_id,
                SaludSitio3Model.empresa_id == empresa_id,
                SaludSitio3Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: SaludS3Create) -> SaludSitio3Model:
        reg = SaludSitio3Model(**data.dict())
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: SaludSitio3Model, cambios: SaludS3Update
    ) -> SaludSitio3Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: SaludSitio3Model) -> None:
        self.db.delete(reg)
        self.db.commit()
