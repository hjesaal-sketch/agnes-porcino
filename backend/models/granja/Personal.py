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


class PersonalGranjaModel(Base):
    __tablename__ = "farm_staff"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(150), nullable=False)
    cargo = Column(String(120), nullable=False)
    turno = Column(String(30), nullable=False)
    capacitaciones = Column(Text, nullable=False)
    fechaIngreso = Column(Date, nullable=False)
    estado = Column(String(30), nullable=False)
    contacto = Column(String(150), nullable=False)
    organigrama = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ===== Pydantic =====

class PersonalGranjaBase(BaseModel):
    empresa_id: int
    granja_id: int

    nombre: str
    cargo: str
    turno: str           # "Mañana" | "Tarde" | "Noche" | "Rotativo"
    capacitaciones: str
    fechaIngreso: date
    estado: str          # "Activo" | "Suspendido" | "Baja"
    contacto: str
    organigrama: str
    observaciones: Optional[str] = None


class PersonalGranjaCreate(PersonalGranjaBase):
    pass


class PersonalGranjaUpdate(BaseModel):
    nombre: Optional[str] = None
    cargo: Optional[str] = None
    turno: Optional[str] = None
    capacitaciones: Optional[str] = None
    fechaIngreso: Optional[date] = None
    estado: Optional[str] = None
    contacto: Optional[str] = None
    organigrama: Optional[str] = None
    observaciones: Optional[str] = None


class PersonalGranjaRead(PersonalGranjaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====

class PersonalRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[PersonalGranjaModel]:
        return (
            self.db.query(PersonalGranjaModel)
            .filter(
                PersonalGranjaModel.empresa_id == empresa_id,
                PersonalGranjaModel.granja_id == granja_id,
            )
            .order_by(PersonalGranjaModel.nombre.asc())
            .all()
        )

    def obtener_por_id(
        self, pers_id: int, empresa_id: int, granja_id: int
    ) -> Optional[PersonalGranjaModel]:
        return (
            self.db.query(PersonalGranjaModel)
            .filter(
                PersonalGranjaModel.id == pers_id,
                PersonalGranjaModel.empresa_id == empresa_id,
                PersonalGranjaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: PersonalGranjaCreate) -> PersonalGranjaModel:
        reg = PersonalGranjaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            cargo=data.cargo,
            turno=data.turno,
            capacitaciones=data.capacitaciones,
            fechaIngreso=data.fechaIngreso,
            estado=data.estado,
            contacto=data.contacto,
            organigrama=data.organigrama,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: PersonalGranjaModel, cambios: PersonalGranjaUpdate
    ) -> PersonalGranjaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: PersonalGranjaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
