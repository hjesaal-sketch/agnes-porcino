# backend/models/maternidad/Alertas.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Boolean,
    Text,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field


# =========================
# MODELO SQLALCHEMY
# =========================

class MaternidadAlerta(Base):
    __tablename__ = "maternity_alerts"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    sow_id = Column(Integer, ForeignKey("sows.id"), nullable=True)
    servicio_id = Column(Integer, ForeignKey("gestation_services.id"), nullable=True)
    parto_programado_id = Column(
        Integer, ForeignKey("scheduled_farrowings.id"), nullable=True
    )

    # Campos “clásicos” de alertas de gestación
    tipo = Column(String(50), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha_objetivo = Column(Date, nullable=True)
    leida = Column(Boolean, nullable=False, default=False)

    # Campos que tu frontend ya usa en Maternidad
    fecha = Column(String, nullable=True)              # fecha libre de la alerta
    nivel = Column(String(50), nullable=True)          # Crítico | Advertencia | Informativo
    descripcion = Column(Text, nullable=True)
    responsable = Column(String(100), nullable=True)
    estado = Column(String(20), nullable=False, default="Abierta")  # Abierta | Cerrada
    acciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# =========================
# ESQUEMAS Pydantic (API)
# =========================

class MaternidadAlertaBase(BaseModel):
    empresa_id: int
    granja_id: int

    tipo: str = Field(..., max_length=50)
    mensaje: str
    fecha_objetivo: Optional[date] = None
    sow_id: Optional[int] = None
    servicio_id: Optional[int] = None
    parto_programado_id: Optional[int] = None
    leida: bool = False

    # Campos extra de la UI
    fecha: Optional[str] = None
    nivel: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    estado: str = "Abierta"
    acciones: Optional[str] = None


class MaternidadAlertaCreate(MaternidadAlertaBase):
    pass


class MaternidadAlertaUpdate(BaseModel):
    tipo: Optional[str] = Field(None, max_length=50)
    mensaje: Optional[str] = None
    fecha_objetivo: Optional[date] = None
    leida: Optional[bool] = None

    fecha: Optional[str] = None
    nivel: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    estado: Optional[str] = None
    acciones: Optional[str] = None


class MaternidadAlertaRead(MaternidadAlertaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# REPOSITORIO / SERVICIO
# =========================

class MaternidadAlertasRepository:
    """Capa de acceso a datos para alertas de maternidad."""

    def __init__(self, db: Session):
        self.db = db

    # --- Lectura ---

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        solo_pendientes: bool = False,
    ) -> List[MaternidadAlerta]:
        query = (
            self.db.query(MaternidadAlerta)
            .filter(
                MaternidadAlerta.empresa_id == empresa_id,
                MaternidadAlerta.granja_id == granja_id,
            )
            .order_by(
                MaternidadAlerta.fecha_objetivo.is_(None),
                MaternidadAlerta.fecha_objetivo,
            )
        )
        if solo_pendientes:
            query = query.filter(MaternidadAlerta.leida.is_(False))
        return query.all()

    def obtener_por_id(
        self, alerta_id: int, empresa_id: int, granja_id: int
    ) -> Optional[MaternidadAlerta]:
        return (
            self.db.query(MaternidadAlerta)
            .filter(
                MaternidadAlerta.id == alerta_id,
                MaternidadAlerta.empresa_id == empresa_id,
                MaternidadAlerta.granja_id == granja_id,
            )
            .first()
        )

    # --- Escritura ---

    def crear(self, data: MaternidadAlertaCreate) -> MaternidadAlerta:
        alerta = MaternidadAlerta(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            sow_id=data.sow_id,
            servicio_id=data.servicio_id,
            parto_programado_id=data.parto_programado_id,
            tipo=data.tipo,
            mensaje=data.mensaje,
            fecha_objetivo=data.fecha_objetivo,
            leida=data.leida,
            fecha=data.fecha,
            nivel=data.nivel,
            descripcion=data.descripcion,
            responsable=data.responsable,
            estado=data.estado,
            acciones=data.acciones,
        )
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def actualizar(
        self,
        alerta: MaternidadAlerta,
        cambios: MaternidadAlertaUpdate,
    ) -> MaternidadAlerta:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(alerta, campo, valor)
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def marcar_leida(
        self,
        alerta: MaternidadAlerta,
        leida: bool = True,
    ) -> MaternidadAlerta:
        alerta.leida = leida
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def eliminar(self, alerta: MaternidadAlerta) -> None:
        self.db.delete(alerta)
        self.db.commit()
