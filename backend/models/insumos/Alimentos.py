# backend/models/insumos/Alimentos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field

from backend.validators.insumos_alimentos_validators import (
    DatosAlimento,
    AlimentosValidators,
    AlimentoValidationError,
)


# =============== SQLAlchemy ===============


class AlimentoModel(Base):
    __tablename__ = "supplies_feeds"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    tipo = Column(String(100), nullable=False)
    fase = Column(String(100), nullable=False)
    proteina = Column(String(50), nullable=True)
    energia_kcal = Column(String(50), nullable=True)
    presentacion = Column(String(100), nullable=True)
    proveedor = Column(String(100), nullable=True)
    lote = Column(String(100), nullable=True)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    stock = Column(Float, nullable=False)
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


class AlimentoBase(BaseModel):
    empresa_id: int
    granja_id: int

    tipo: str
    fase: str
    proteina: str = ""
    energiaKcal: str = Field("", alias="energiaKcal")
    presentacion: str = ""
    proveedor: str = ""
    lote: str = ""
    cantidad: float
    unidad: str
    stock: float
    vencimiento: Optional[date] = None
    observaciones: Optional[str] = None


class AlimentoCreate(AlimentoBase):
    pass


class AlimentoUpdate(BaseModel):
    tipo: Optional[str] = None
    fase: Optional[str] = None
    proteina: Optional[str] = None
    energiaKcal: Optional[str] = None
    presentacion: Optional[str] = None
    proveedor: Optional[str] = None
    lote: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    stock: Optional[float] = None
    vencimiento: Optional[date] = None
    observaciones: Optional[str] = None


class AlimentoRead(AlimentoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        allow_population_by_field_name = True


# =============== Repositorio ===============


class AlimentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[AlimentoModel]:
        return (
            self.db.query(AlimentoModel)
            .filter(
                AlimentoModel.empresa_id == empresa_id,
                AlimentoModel.granja_id == granja_id,
            )
            .order_by(AlimentoModel.vencimiento.asc().nulls_last())
            .all()
        )

    def obtener_por_id(
        self, alimento_id: int, empresa_id: int, granja_id: int
    ) -> Optional[AlimentoModel]:
        return (
            self.db.query(AlimentoModel)
            .filter(
                AlimentoModel.id == alimento_id,
                AlimentoModel.empresa_id == empresa_id,
                AlimentoModel.granja_id == granja_id,
            )
            .first()
        )

    def _validar(self, data: AlimentoBase) -> None:
        """
        Empaqueta datos en el DTO de validación y aplica reglas de negocio.
        """
        dto = DatosAlimento(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            tipo=data.tipo,
            fase=data.fase,
            cantidad=data.cantidad,
            stock=data.stock,
            lote=data.lote,
            unidad=data.unidad,
            vencimiento=data.vencimiento,
        )
        AlimentosValidators.validar_alimento(dto)

    def crear(self, data: AlimentoCreate) -> AlimentoModel:
        # Validaciones de negocio
        try:
            self._validar(data)
        except AlimentoValidationError as exc:
            # Se relanza para que la API lo traduzca a 422
            raise AlimentoValidationError(str(exc))

        alimento = AlimentoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            tipo=data.tipo,
            fase=data.fase,
            proteina=data.proteina,
            energia_kcal=data.energiaKcal,
            presentacion=data.presentacion,
            proveedor=data.proveedor,
            lote=data.lote,
            cantidad=data.cantidad,
            unidad=data.unidad,
            stock=data.stock,
            vencimiento=data.vencimiento,
            observaciones=data.observaciones,
        )
        self.db.add(alimento)
        self.db.commit()
        self.db.refresh(alimento)
        return alimento

    def actualizar(self, alimento: AlimentoModel, cambios: AlimentoUpdate) -> AlimentoModel:
        datos = cambios.dict(exclude_unset=True)

        # Aplicar cambios en el modelo
        for campo, valor in datos.items():
            if campo == "energiaKcal":
                setattr(alimento, "energia_kcal", valor)
            else:
                setattr(alimento, campo, valor)

        # Validar de nuevo con el estado actualizado
        base = AlimentoBase(
            empresa_id=alimento.empresa_id,
            granja_id=alimento.granja_id,
            tipo=alimento.tipo,
            fase=alimento.fase,
            proteina=alimento.proteina or "",
            energiaKcal=alimento.energia_kcal or "",
            presentacion=alimento.presentacion or "",
            proveedor=alimento.proveedor or "",
            lote=alimento.lote or "",
            cantidad=alimento.cantidad,
            unidad=alimento.unidad,
            stock=alimento.stock,
            vencimiento=alimento.vencimiento,
            observaciones=alimento.observaciones,
        )
        try:
            self._validar(base)
        except AlimentoValidationError as exc:
            raise AlimentoValidationError(str(exc))

        self.db.add(alimento)
        self.db.commit()
        self.db.refresh(alimento)
        return alimento

    def eliminar(self, alimento: AlimentoModel) -> None:
        self.db.delete(alimento)
        self.db.commit()
