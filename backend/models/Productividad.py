# backend/models/Productividad.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List
from enum import Enum

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class EstadoIndicador(str, Enum):
    BUENO = "Bueno"
    ATENCION = "Atención"
    CRITICO = "Crítico"


class IndicadorProdModel(Base):
    __tablename__ = "productividad_indicadores"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(200), nullable=False)
    valor = Column(String(50), nullable=False)
    unidad = Column(String(50), nullable=True)
    objetivo = Column(String(50), nullable=False)
    estado = Column(String(50), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class HistorialProdModel(Base):
    __tablename__ = "productividad_historial"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo = Column(String(20), nullable=False)
    sitio = Column(String(50), nullable=False)
    animales_ingresados = Column(Integer, nullable=False)
    animales_salidos = Column(Integer, nullable=False)
    kilos_vendidos = Column(Float, nullable=False)
    mortalidad = Column(Float, nullable=False)
    fcr = Column(Float, nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class IndicadorProdBase(BaseModel):
    empresa_id: int
    granja_id: int
    nombre: str
    valor: str
    unidad: Optional[str] = None
    objetivo: str
    estado: EstadoIndicador


class IndicadorProdCreate(IndicadorProdBase):
    pass


class IndicadorProdRead(IndicadorProdBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HistorialProdBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo: str
    sitio: str
    animales_ingresados: int
    animales_salidos: int
    kilos_vendidos: float
    mortalidad: float
    fcr: float


class HistorialProdCreate(HistorialProdBase):
    pass


class HistorialProdRead(HistorialProdBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductividadRepository:
    def __init__(self, db: Session):
        self.db = db

    # Indicadores
    def listar_indicadores(
        self, empresa_id: int, granja_id: int
    ) -> List[IndicadorProdModel]:
        return (
            self.db.query(IndicadorProdModel)
            .filter(
                IndicadorProdModel.empresa_id == empresa_id,
                IndicadorProdModel.granja_id == granja_id,
            )
            .all()
        )

    def crear_indicador(self, data: IndicadorProdCreate) -> IndicadorProdModel:
        reg = IndicadorProdModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            valor=data.valor,
            unidad=data.unidad,
            objetivo=data.objetivo,
            estado=data.estado.value,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar_indicador(
        self, id: int, data: IndicadorProdBase
    ) -> IndicadorProdModel:
        reg = self.db.query(IndicadorProdModel).filter(IndicadorProdModel.id == id).first()
        if not reg:
            return None
        reg.nombre = data.nombre
        reg.valor = data.valor
        reg.unidad = data.unidad
        reg.objetivo = data.objetivo
        reg.estado = data.estado.value
        reg.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(reg)
        return reg

    # Historial
    def listar_historial(
        self, empresa_id: int, granja_id: int
    ) -> List[HistorialProdModel]:
        return (
            self.db.query(HistorialProdModel)
            .filter(
                HistorialProdModel.empresa_id == empresa_id,
                HistorialProdModel.granja_id == granja_id,
            )
            .order_by(HistorialProdModel.periodo.desc())
            .all()
        )

    def crear_historial(self, data: HistorialProdCreate) -> HistorialProdModel:
        reg = HistorialProdModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo=data.periodo,
            sitio=data.sitio,
            animales_ingresados=data.animales_ingresados,
            animales_salidos=data.animales_salidos,
            kilos_vendidos=data.kilos_vendidos,
            mortalidad=data.mortalidad,
            fcr=data.fcr,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg
