# backend/models/Estadisticas.py
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


class IndicadorEstadisticaModel(Base):
    __tablename__ = "estadisticas_indicadores"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(200), nullable=False)
    valor = Column(String(50), nullable=False)
    unidad = Column(String(50), nullable=True)
    objetivo = Column(String(50), nullable=False)
    estado = Column(String(50), nullable=False)
    categoria = Column(String(50), nullable=False)  # "Reproductivo" o "Productivo"

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class ResumenMensualModel(Base):
    __tablename__ = "estadisticas_resumen_mensual"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    mes = Column(String(20), nullable=False)
    partos = Column(Integer, nullable=False)
    lechones_destetados = Column(Integer, nullable=False)
    mortalidad_total = Column(Float, nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class ResumenGlobalModel(Base):
    __tablename__ = "estadisticas_resumen_global"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    periodo_meses = Column(Integer, nullable=False)  # ej: 12
    total_partos = Column(Integer, nullable=False)
    total_destetados = Column(Integer, nullable=False)
    mortalidad_promedio = Column(String(50), nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class IndicadorEstadisticaBase(BaseModel):
    empresa_id: int
    granja_id: int
    nombre: str
    valor: str
    unidad: Optional[str] = None
    objetivo: str
    estado: EstadoIndicador
    categoria: str


class IndicadorEstadisticaCreate(IndicadorEstadisticaBase):
    pass


class IndicadorEstadisticaRead(IndicadorEstadisticaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumenMensualBase(BaseModel):
    empresa_id: int
    granja_id: int
    mes: str
    partos: int
    lechones_destetados: int
    mortalidad_total: float


class ResumenMensualCreate(ResumenMensualBase):
    pass


class ResumenMensualRead(ResumenMensualBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumenGlobalBase(BaseModel):
    empresa_id: int
    granja_id: int
    periodo_meses: int
    total_partos: int
    total_destetados: int
    mortalidad_promedio: str


class ResumenGlobalCreate(ResumenGlobalBase):
    pass


class ResumenGlobalRead(ResumenGlobalBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EstadisticasRepository:
    def __init__(self, db: Session):
        self.db = db

    # Indicadores
    def listar_indicadores(
        self, empresa_id: int, granja_id: int, categoria: Optional[str] = None
    ) -> List[IndicadorEstadisticaModel]:
        q = self.db.query(IndicadorEstadisticaModel).filter(
            IndicadorEstadisticaModel.empresa_id == empresa_id,
            IndicadorEstadisticaModel.granja_id == granja_id,
        )
        if categoria:
            q = q.filter(IndicadorEstadisticaModel.categoria == categoria)
        return q.all()

    def crear_indicador(
        self, data: IndicadorEstadisticaCreate
    ) -> IndicadorEstadisticaModel:
        reg = IndicadorEstadisticaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            valor=data.valor,
            unidad=data.unidad,
            objetivo=data.objetivo,
            estado=data.estado.value,
            categoria=data.categoria,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    # Resumen mensual
    def listar_resumen_mensual(
        self, empresa_id: int, granja_id: int
    ) -> List[ResumenMensualModel]:
        return (
            self.db.query(ResumenMensualModel)
            .filter(
                ResumenMensualModel.empresa_id == empresa_id,
                ResumenMensualModel.granja_id == granja_id,
            )
            .order_by(ResumenMensualModel.mes)
            .all()
        )

    def crear_resumen_mensual(
        self, data: ResumenMensualCreate
    ) -> ResumenMensualModel:
        reg = ResumenMensualModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            mes=data.mes,
            partos=data.partos,
            lechones_destetados=data.lechones_destetados,
            mortalidad_total=data.mortalidad_total,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    # Resumen global
    def obtener_resumen_global(
        self, empresa_id: int, granja_id: int
    ) -> ResumenGlobalModel:
        return (
            self.db.query(ResumenGlobalModel)
            .filter(
                ResumenGlobalModel.empresa_id == empresa_id,
                ResumenGlobalModel.granja_id == granja_id,
            )
            .first()
        )

    def crear_resumen_global(
        self, data: ResumenGlobalCreate
    ) -> ResumenGlobalModel:
        reg = ResumenGlobalModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            periodo_meses=data.periodo_meses,
            total_partos=data.total_partos,
            total_destetados=data.total_destetados,
            mortalidad_promedio=data.mortalidad_promedio,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar_resumen_global(
        self, empresa_id: int, granja_id: int, data: ResumenGlobalCreate
    ) -> ResumenGlobalModel:
        reg = (
            self.db.query(ResumenGlobalModel)
            .filter(
                ResumenGlobalModel.empresa_id == empresa_id,
                ResumenGlobalModel.granja_id == granja_id,
            )
            .first()
        )
        if not reg:
            return self.crear_resumen_global(data)
        reg.periodo_meses = data.periodo_meses
        reg.total_partos = data.total_partos
        reg.total_destetados = data.total_destetados
        reg.mortalidad_promedio = data.mortalidad_promedio
        reg.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(reg)
        return reg
