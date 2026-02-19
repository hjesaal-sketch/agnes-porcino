# backend/models/insumos/Costos.py
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

from pydantic import BaseModel
from backend.database import Base


# =============== SQLAlchemy ===============

class CostoInsumoModel(Base):
    __tablename__ = "supplies_costs"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    modulo = Column(String(50), nullable=False)      # Maternidad, Gestación, Granja, etc.
    categoria = Column(String(50), nullable=False)   # Alimentos, Medicamentos, Limpieza, etc.
    insumo = Column(String(100), nullable=False)     # Nombre o referencia del insumo
    lote = Column(String(100), nullable=True)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    costo_unitario = Column(Float, nullable=False)
    costo_total = Column(Float, nullable=False)
    proveedor = Column(String(100), nullable=True)
    descripcion = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============

class CostoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fecha: date
    modulo: str
    categoria: str
    insumo: str
    lote: Optional[str] = None
    cantidad: float
    unidad: str
    costo_unitario: float
    costo_total: float
    proveedor: Optional[str] = None
    descripcion: Optional[str] = None


class CostoCreate(CostoBase):
    pass


class CostoUpdate(BaseModel):
    fecha: Optional[date] = None
    modulo: Optional[str] = None
    categoria: Optional[str] = None
    insumo: Optional[str] = None
    lote: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    costo_unitario: Optional[float] = None
    costo_total: Optional[float] = None
    proveedor: Optional[str] = None
    descripcion: Optional[str] = None


class CostoRead(CostoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class CostoInsumoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
    ) -> List[CostoInsumoModel]:
        return (
            self.db.query(CostoInsumoModel)
            .filter(
                CostoInsumoModel.empresa_id == empresa_id,
                CostoInsumoModel.granja_id == granja_id,
            )
            .order_by(CostoInsumoModel.fecha.desc(), CostoInsumoModel.id.desc())
            .all()
        )

    def obtener_por_id(
        self,
        costo_id: int,
        empresa_id: int,
        granja_id: int,
    ) -> Optional[CostoInsumoModel]:
        return (
            self.db.query(CostoInsumoModel)
            .filter(
                CostoInsumoModel.id == costo_id,
                CostoInsumoModel.empresa_id == empresa_id,
                CostoInsumoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: CostoCreate) -> CostoInsumoModel:
        reg = CostoInsumoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            modulo=data.modulo,
            categoria=data.categoria,
            insumo=data.insumo,
            lote=data.lote,
            cantidad=data.cantidad,
            unidad=data.unidad,
            costo_unitario=data.costo_unitario,
            costo_total=data.costo_total,
            proveedor=data.proveedor,
            descripcion=data.descripcion,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self,
        reg: CostoInsumoModel,
        cambios: CostoUpdate,
    ) -> CostoInsumoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: CostoInsumoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
