# backend/models/genetica/Reproductores.py
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


class VerracoModel(Base):
    __tablename__ = "genetica_verracos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    identificacion = Column(String(80), nullable=False, index=True)
    raza = Column(String(80), nullable=False)
    fechaNacimiento = Column(Date, nullable=False)
    origen = Column(String(120), nullable=False)
    padre = Column(String(120), nullable=False)
    madre = Column(String(120), nullable=False)
    peso = Column(Float, nullable=False)
    estadoReproductivo = Column(String(30), nullable=False)
    salud = Column(String(120), nullable=False)
    valorGenetico = Column(String(120), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# ===== Pydantic =====


class VerracoBase(BaseModel):
    empresa_id: int
    granja_id: int

    identificacion: str
    raza: str
    fechaNacimiento: date
    origen: str
    padre: str
    madre: str
    peso: float = Field(ge=0)
    estadoReproductivo: str  # "Activo" | "Reposo" | "Baja"
    salud: str
    valorGenetico: str
    observaciones: Optional[str] = None


class VerracoCreate(VerracoBase):
    pass


class VerracoUpdate(BaseModel):
    identificacion: Optional[str] = None
    raza: Optional[str] = None
    fechaNacimiento: Optional[date] = None
    origen: Optional[str] = None
    padre: Optional[str] = None
    madre: Optional[str] = None
    peso: Optional[float] = Field(default=None, ge=0)
    estadoReproductivo: Optional[str] = None
    salud: Optional[str] = None
    valorGenetico: Optional[str] = None
    observaciones: Optional[str] = None


class VerracoRead(VerracoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====


class VerracoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[VerracoModel]:
        return (
            self.db.query(VerracoModel)
            .filter(
                VerracoModel.empresa_id == empresa_id,
                VerracoModel.granja_id == granja_id,
            )
            .order_by(VerracoModel.identificacion.asc())
            .all()
        )

    def obtener_por_id(
        self, verraco_id: int, empresa_id: int, granja_id: int
    ) -> Optional[VerracoModel]:
        return (
            self.db.query(VerracoModel)
            .filter(
                VerracoModel.id == verraco_id,
                VerracoModel.empresa_id == empresa_id,
                VerracoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: VerracoCreate) -> VerracoModel:
        reg = VerracoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            identificacion=data.identificacion,
            raza=data.raza,
            fechaNacimiento=data.fechaNacimiento,
            origen=data.origen,
            padre=data.padre,
            madre=data.madre,
            peso=data.peso,
            estadoReproductivo=data.estadoReproductivo,
            salud=data.salud,
            valorGenetico=data.valorGenetico,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(self, reg: VerracoModel, cambios: VerracoUpdate) -> VerracoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: VerracoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
