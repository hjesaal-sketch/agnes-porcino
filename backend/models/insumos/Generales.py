from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from pydantic import BaseModel
from backend.database import Base

from backend.validators.insumos_generales_validators import (
    DatosInsumoGeneral,
    InsumosGeneralesValidators,
    InsumoGeneralValidationError,
)


# =============== SQLAlchemy ===============


class InsumoGeneralModel(Base):
    __tablename__ = "supplies_generals"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    descripcion = Column(String(150), nullable=False)
    categoria = Column(String(50), nullable=False)   # Oficina, Identificación, etc.
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    stock = Column(Float, nullable=False)
    proveedor = Column(String(120), nullable=True)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============


class InsumoGeneralBase(BaseModel):
    empresa_id: int
    granja_id: int

    descripcion: str
    categoria: str
    cantidad: float
    unidad: str
    stock: float
    proveedor: str = ""
    observaciones: Optional[str] = None


class InsumoGeneralCreate(InsumoGeneralBase):
    pass


class InsumoGeneralUpdate(BaseModel):
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    stock: Optional[float] = None
    proveedor: Optional[str] = None
    observaciones: Optional[str] = None


class InsumoGeneralRead(InsumoGeneralBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============


class InsumoGeneralRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[InsumoGeneralModel]:
        return (
            self.db.query(InsumoGeneralModel)
            .filter(
                InsumoGeneralModel.empresa_id == empresa_id,
                InsumoGeneralModel.granja_id == granja_id,
            )
            .order_by(InsumoGeneralModel.descripcion.asc())
            .all()
        )

    def obtener_por_id(
        self, insumo_id: int, empresa_id: int, granja_id: int
    ) -> Optional[InsumoGeneralModel]:
        return (
            self.db.query(InsumoGeneralModel)
            .filter(
                InsumoGeneralModel.id == insumo_id,
                InsumoGeneralModel.empresa_id == empresa_id,
                InsumoGeneralModel.granja_id == granja_id,
            )
            .first()
        )

    def _validar(self, data: InsumoGeneralBase) -> None:
        """
        Valida que el stock no sea negativo (estado actual del registro).

        Futuro:
        - Aquí podrías calcular el stock_resultante a partir de un movimiento
          (entrada/salida/ajuste) antes de persistirlo.
        """
        dto = DatosInsumoGeneral(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            descripcion=data.descripcion,
            categoria=data.categoria,
            stock_resultante=data.stock,
            # Hooks de movimiento/destino aún no usados en este flujo:
            tipo_movimiento=None,
            cantidad_movimiento=None,
            destino_tipo=None,
            destino_id=None,
        )
        InsumosGeneralesValidators.validar_insumo_general(dto)

    def crear(self, data: InsumoGeneralCreate) -> InsumoGeneralModel:
        try:
            self._validar(data)
        except InsumoGeneralValidationError as exc:
            raise InsumoGeneralValidationError(str(exc))

        reg = InsumoGeneralModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            descripcion=data.descripcion,
            categoria=data.categoria,
            cantidad=data.cantidad,
            unidad=data.unidad,
            stock=data.stock,
            proveedor=data.proveedor,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: InsumoGeneralModel, cambios: InsumoGeneralUpdate
    ) -> InsumoGeneralModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)

        base = InsumoGeneralBase(
            empresa_id=reg.empresa_id,
            granja_id=reg.granja_id,
            descripcion=reg.descripcion,
            categoria=reg.categoria,
            cantidad=reg.cantidad,
            unidad=reg.unidad,
            stock=reg.stock,
            proveedor=reg.proveedor or "",
            observaciones=reg.observaciones,
        )
        try:
            self._validar(base)
        except InsumoGeneralValidationError as exc:
            raise InsumoGeneralValidationError(str(exc))

        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: InsumoGeneralModel) -> None:
        self.db.delete(reg)
        self.db.commit()
