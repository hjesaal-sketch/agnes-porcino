# backend/models/maternidad/Lactancia.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field


# =============== SQLAlchemy ===============

class ControlLactanciaModel(Base):
    __tablename__ = "maternity_lactation_controls"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    identificacion_madre = Column(String(50), nullable=False)
    numero_lechones = Column(Integer, nullable=False)
    consumo_alimento_kg = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Aliases camelCase para el esquema Pydantic
    @property
    def identificacionMadre(self) -> str:
        return self.identificacion_madre

    @property
    def numeroLechones(self) -> int:
        return self.numero_lechones

    @property
    def consumoAlimentoKg(self) -> float:
        return self.consumo_alimento_kg


# =============== Pydantic ===============

class ControlLactanciaBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    identificacionMadre: str = Field(..., max_length=50)
    numeroLechones: int
    consumoAlimentoKg: float
    responsable: str
    observaciones: Optional[str] = None


class ControlLactanciaCreate(ControlLactanciaBase):
    pass


class ControlLactanciaUpdate(BaseModel):
    fecha: Optional[date] = None
    identificacionMadre: Optional[str] = Field(None, max_length=50)
    numeroLechones: Optional[int] = None
    consumoAlimentoKg: Optional[float] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None


class ControlLactanciaRead(ControlLactanciaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class LactanciaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ControlLactanciaModel]:
        return (
            self.db.query(ControlLactanciaModel)
            .filter(
                ControlLactanciaModel.empresa_id == empresa_id,
                ControlLactanciaModel.granja_id == granja_id,
            )
            .order_by(ControlLactanciaModel.fecha.desc())
            .all()
        )

    def obtener_por_id(
        self, control_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ControlLactanciaModel]:
        return (
            self.db.query(ControlLactanciaModel)
            .filter(
                ControlLactanciaModel.id == control_id,
                ControlLactanciaModel.empresa_id == empresa_id,
                ControlLactanciaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ControlLactanciaCreate) -> ControlLactanciaModel:
        control = ControlLactanciaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            identificacion_madre=data.identificacionMadre,
            numero_lechones=data.numeroLechones,
            consumo_alimento_kg=data.consumoAlimentoKg,
            responsable=data.responsable,
            observaciones=data.observaciones,
        )
        self.db.add(control)
        self.db.commit()
        self.db.refresh(control)
        return control

    def actualizar(
        self, control: ControlLactanciaModel, cambios: ControlLactanciaUpdate
    ) -> ControlLactanciaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            if campo == "identificacionMadre":
                setattr(control, "identificacion_madre", valor)
            elif campo == "numeroLechones":
                setattr(control, "numero_lechones", valor)
            elif campo == "consumoAlimentoKg":
                setattr(control, "consumo_alimento_kg", valor)
            else:
                setattr(control, campo, valor)
        self.db.add(control)
        self.db.commit()
        self.db.refresh(control)
        return control

    def eliminar(self, control: ControlLactanciaModel) -> None:
        self.db.delete(control)
        self.db.commit()
