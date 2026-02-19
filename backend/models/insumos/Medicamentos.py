# backend/models/insumos/Medicamentos.py
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
from backend.validators.insumos_medicamentos_validators import (
    DatosMedicamento,
    MedicamentosValidators,
    MedicamentoValidationError,
)


# =============== SQLAlchemy ===============


class MedicamentoModel(Base):
    __tablename__ = "supplies_medicines"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(150), nullable=False)
    principio = Column(String(150), nullable=True)
    lote = Column(String(80), nullable=True)
    vencimiento = Column(Date, nullable=True)
    laboratorio = Column(String(150), nullable=True)
    tipo = Column(String(50), nullable=False)  # Vacuna, Antibiótico, etc.
    condiciones = Column(Text, nullable=True)
    proveedor = Column(String(150), nullable=True)
    stock = Column(Float, nullable=False)
    unidad = Column(String(20), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =============== Pydantic ===============


class MedicamentoBase(BaseModel):
    empresa_id: int
    granja_id: int

    nombre: str
    principio: str = ""
    lote: str = ""
    vencimiento: Optional[date] = None
    laboratorio: str = ""
    tipo: str
    condiciones: str = ""
    proveedor: str = ""
    stock: float
    unidad: str
    observaciones: Optional[str] = None


class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(BaseModel):
    nombre: Optional[str] = None
    principio: Optional[str] = None
    lote: Optional[str] = None
    vencimiento: Optional[date] = None
    laboratorio: Optional[str] = None
    tipo: Optional[str] = None
    condiciones: Optional[str] = None
    proveedor: Optional[str] = None
    stock: Optional[float] = None
    unidad: Optional[str] = None
    observaciones: Optional[str] = None


class MedicamentoRead(MedicamentoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============


class MedicamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[MedicamentoModel]:
        return (
            self.db.query(MedicamentoModel)
            .filter(
                MedicamentoModel.empresa_id == empresa_id,
                MedicamentoModel.granja_id == granja_id,
            )
            .order_by(MedicamentoModel.nombre.asc())
            .all()
        )

    def obtener_por_id(
        self, med_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MedicamentoModel]:
        return (
            self.db.query(MedicamentoModel)
            .filter(
                MedicamentoModel.id == med_id,
                MedicamentoModel.empresa_id == empresa_id,
                MedicamentoModel.granja_id == granja_id,
            )
            .first()
        )

    def _validar(self, data: MedicamentoBase) -> None:
        """
        Empaqueta datos en el DTO de validación y aplica reglas de negocio.
        Por ahora solo usamos stock y vencimiento, pero el DTO ya soporta
        especie/peso/edad/dosis/tiempo_retiro para futuros usos.
        """
        dto = DatosMedicamento(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            tipo=data.tipo,
            lote=data.lote,
            stock=data.stock,
            unidad=data.unidad,
            vencimiento=data.vencimiento,
            especie=None,
            producto=None,
            peso_kg=None,
            edad_dias=None,
            dosis=None,
            tiempo_retiro_dias=None,
        )
        MedicamentosValidators.validar_medicamento(dto)

    def crear(self, data: MedicamentoCreate) -> MedicamentoModel:
        try:
            self._validar(data)
        except MedicamentoValidationError as exc:
            raise MedicamentoValidationError(str(exc))

        reg = MedicamentoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            nombre=data.nombre,
            principio=data.principio,
            lote=data.lote,
            vencimiento=data.vencimiento,
            laboratorio=data.laboratorio,
            tipo=data.tipo,
            condiciones=data.condiciones,
            proveedor=data.proveedor,
            stock=data.stock,
            unidad=data.unidad,
            observaciones=data.observaciones,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: MedicamentoModel, cambios: MedicamentoUpdate
    ) -> MedicamentoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)

        base = MedicamentoBase(
            empresa_id=reg.empresa_id,
            granja_id=reg.granja_id,
            nombre=reg.nombre,
            principio=reg.principio or "",
            lote=reg.lote or "",
            vencimiento=reg.vencimiento,
            laboratorio=reg.laboratorio or "",
            tipo=reg.tipo,
            condiciones=reg.condiciones or "",
            proveedor=reg.proveedor or "",
            stock=reg.stock,
            unidad=reg.unidad,
            observaciones=reg.observaciones,
        )
        try:
            self._validar(base)
        except MedicamentoValidationError as exc:
            raise MedicamentoValidationError(str(exc))

        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: MedicamentoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
