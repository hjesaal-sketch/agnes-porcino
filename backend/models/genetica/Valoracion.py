# backend/models/genetica/Valoracion.py
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


class ValoracionGeneticaModel(Base):
    __tablename__ = "genetica_valoraciones"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    identificacion = Column(String(80), nullable=False)
    raza = Column(String(80), nullable=False)
    resultado = Column(Text, nullable=False)
    prueba = Column(String(40), nullable=False)
    evaluador = Column(String(120), nullable=False)
    score = Column(Float, nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# ===== Pydantic =====

class ValoracionGeneticaBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    identificacion: str
    raza: str
    resultado: str
    prueba: str   # "Indice Genético" | "Test ADN" | "Morfología" | "Sanidad" | "Otro"
    evaluador: str
    score: float = Field(ge=0)
    observaciones: Optional[str] = None


class ValoracionGeneticaCreate(ValoracionGeneticaBase):
    pass


class ValoracionGeneticaUpdate(BaseModel):
    fecha: Optional[date] = None
    identificacion: Optional[str] = None
    raza: Optional[str] = None
    resultado: Optional[str] = None
    prueba: Optional[str] = None
    evaluador: Optional[str] = None
    score: Optional[float] = Field(default=None, ge=0)
    observaciones: Optional[str] = None


class ValoracionGeneticaRead(ValoracionGeneticaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Repositorio =====

class ValoracionRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ValoracionGeneticaModel]:
        return (
            self.db.query(ValoracionGeneticaModel)
            .filter(
                ValoracionGeneticaModel.empresa_id == empresa_id,
                ValoracionGeneticaModel.granja_id == granja_id,
            )
            .order_by(ValoracionGeneticaModel.fecha.desc(), ValoracionGeneticaModel.id.desc())
            .all()
        )

    def obtener_por_id(
        self, val_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ValoracionGeneticaModel]:
        return (
            self.db.query(ValoracionGeneticaModel)
            .filter(
                ValoracionGeneticaModel.id == val_id,
                ValoracionGeneticaModel.empresa_id == empresa_id,
                ValoracionGeneticaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ValoracionGeneticaCreate) -> ValoracionGeneticaModel:
        reg = ValoracionGeneticaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            identificacion=data.identificacion,
            raza=data.raza,
            resultado=data.resultado,
            prueba=data.prueba,
            evaluador=data.evaluador,
            score=data.score,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ValoracionGeneticaModel, cambios: ValoracionGeneticaUpdate
    ) -> ValoracionGeneticaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ValoracionGeneticaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
