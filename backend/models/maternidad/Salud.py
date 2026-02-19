# backend/models/maternidad/Salud.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field


# =============== SQLAlchemy ===============

class SaludMaternidadModel(Base):
    __tablename__ = "maternity_health_events"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    identificacion_madre = Column(String(50), nullable=False)
    tipo_paciente = Column(String(20), nullable=False)   # Madre | Lechones
    evento = Column(String(30), nullable=False)          # Vacunación | ...
    descripcion = Column(Text, nullable=False)
    responsable = Column(String(100), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============

class SaludBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    identificacionMadre: str = Field(..., max_length=50)
    tipoPaciente: str
    evento: str
    descripcion: str
    responsable: str
    observaciones: Optional[str] = None


class SaludCreate(SaludBase):
    pass


class SaludUpdate(BaseModel):
    fecha: Optional[date] = None
    identificacionMadre: Optional[str] = Field(None, max_length=50)
    tipoPaciente: Optional[str] = None
    evento: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class SaludRead(SaludBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class SaludRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[SaludMaternidadModel]:
        return (
            self.db.query(SaludMaternidadModel)
            .filter(
                SaludMaternidadModel.empresa_id == empresa_id,
                SaludMaternidadModel.granja_id == granja_id,
            )
            .order_by(SaludMaternidadModel.fecha.desc())
            .all()
        )

    def obtener_por_id(
        self, registro_id: int, empresa_id: int, granja_id: int
    ) -> Optional[SaludMaternidadModel]:
        return (
            self.db.query(SaludMaternidadModel)
            .filter(
                SaludMaternidadModel.id == registro_id,
                SaludMaternidadModel.empresa_id == empresa_id,
                SaludMaternidadModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: SaludCreate) -> SaludMaternidadModel:
        reg = SaludMaternidadModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            identificacion_madre=data.identificacionMadre,
            tipo_paciente=data.tipoPaciente,
            evento=data.evento,
            descripcion=data.descripcion,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: SaludMaternidadModel, cambios: SaludUpdate
    ) -> SaludMaternidadModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
          if campo == "identificacionMadre":
              setattr(reg, "identificacion_madre", valor)
          elif campo == "tipoPaciente":
              setattr(reg, "tipo_paciente", valor)
          else:
              setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: SaludMaternidadModel) -> None:
        self.db.delete(reg)
        self.db.commit()
