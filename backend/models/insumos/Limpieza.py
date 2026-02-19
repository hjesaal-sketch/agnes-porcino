# backend/models/insumos/Limpieza.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from pydantic import BaseModel
from backend.database import Base


# =============== SQLAlchemy ===============

class ProductoLimpiezaModel(Base):
    __tablename__ = "supplies_cleaning_products"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    producto = Column(String(150), nullable=False)
    tipo = Column(String(50), nullable=False)        # Desinfectante, Detergente, etc.
    concentracion = Column(String(100), nullable=True)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    stock = Column(Float, nullable=False)
    area = Column(String(120), nullable=True)
    proveedor = Column(String(120), nullable=True)
    vencimiento = Column(Date, nullable=True)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============

class ProductoLimpiezaBase(BaseModel):
    empresa_id: int
    granja_id: int

    producto: str
    tipo: str
    concentracion: str = ""
    cantidad: float
    unidad: str
    stock: float
    area: str = ""
    proveedor: str = ""
    vencimiento: Optional[date] = None
    observaciones: Optional[str] = None


class ProductoLimpiezaCreate(ProductoLimpiezaBase):
    pass


class ProductoLimpiezaUpdate(BaseModel):
    producto: Optional[str] = None
    tipo: Optional[str] = None
    concentracion: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    stock: Optional[float] = None
    area: Optional[str] = None
    proveedor: Optional[str] = None
    vencimiento: Optional[date] = None
    observaciones: Optional[str] = None


class ProductoLimpiezaRead(ProductoLimpiezaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============

class ProductoLimpiezaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[ProductoLimpiezaModel]:
        return (
            self.db.query(ProductoLimpiezaModel)
            .filter(
                ProductoLimpiezaModel.empresa_id == empresa_id,
                ProductoLimpiezaModel.granja_id == granja_id,
            )
            .order_by(ProductoLimpiezaModel.producto.asc())
            .all()
        )

    def obtener_por_id(
        self, prod_id: int, empresa_id: int, granja_id: int
    ) -> Optional[ProductoLimpiezaModel]:
        return (
            self.db.query(ProductoLimpiezaModel)
            .filter(
                ProductoLimpiezaModel.id == prod_id,
                ProductoLimpiezaModel.empresa_id == empresa_id,
                ProductoLimpiezaModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: ProductoLimpiezaCreate) -> ProductoLimpiezaModel:
        reg = ProductoLimpiezaModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            producto=data.producto,
            tipo=data.tipo,
            concentracion=data.concentracion,
            cantidad=data.cantidad,
            unidad=data.unidad,
            stock=data.stock,
            area=data.area,
            proveedor=data.proveedor,
            vencimiento=data.vencimiento,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: ProductoLimpiezaModel, cambios: ProductoLimpiezaUpdate
    ) -> ProductoLimpiezaModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: ProductoLimpiezaModel) -> None:
        self.db.delete(reg)
        self.db.commit()
