# backend/models/sitio2/SaludBienestar.py
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


class SaludBienestarSitio2Model(Base):
    __tablename__ = "sitio2_salud_bienestar"

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


class SaludBienestarBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    corral: str
    lote: str
    evento: str
    tratamiento: str
    responsable: str
    observaciones: Optional[str] = None


class SaludBienestarCreate(SaludBienestarBase):
    pass


class SaludBienestarUpdate(BaseModel):
    fecha: Optional[date] = None
    corral: Optional[str] = None
    lote: Optional[str] = None
    evento: Optional[str] = None
    tratamiento: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class SaludBienestarRead(SaludBienestarBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SaludBienestarRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[SaludBienestarSitio2Model]:
        return (
            self.db.query(SaludBienestarSitio2Model)
            .filter(
                SaludBienestarSitio2Model.empresa_id == empresa_id,
                SaludBienestarSitio2Model.granja_id == granja_id,
            )
            .order_by(
                SaludBienestarSitio2Model.fecha.desc(),
                SaludBienestarSitio2Model.id.desc(),
            )
            .all()
        )

    def obtener_por_id(
        self, reg_id: int, empresa_id: int, granja_id: int
    ) -> Optional[SaludBienestarSitio2Model]:
        return (
            self.db.query(SaludBienestarSitio2Model)
            .filter(
                SaludBienestarSitio2Model.id == reg_id,
                SaludBienestarSitio2Model.empresa_id == empresa_id,
                SaludBienestarSitio2Model.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: SaludBienestarCreate) -> SaludBienestarSitio2Model:
        reg = SaludBienestarSitio2Model(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            corral=data.corral,
            lote=data.lote,
            evento=data.evento,
            tratamiento=data.tratamiento,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: SaludBienestarSitio2Model, cambios: SaludBienestarUpdate
    ) -> SaludBienestarSitio2Model:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: SaludBienestarSitio2Model) -> None:
        self.db.delete(reg)
        self.db.commit()
