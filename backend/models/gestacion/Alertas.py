# backend/models/gestacion/Alertas.py
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
from sqlalchemy.orm import relationship, Session

from backend.database import Base
from pydantic import BaseModel, Field


# =========================
# MODELO SQLALCHEMY
# =========================

class GestacionAlerta(Base):
    __tablename__ = "gestation_alerts"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    sow_id = Column(Integer, ForeignKey("sows.id"), nullable=True)
    servicio_id = Column(Integer, ForeignKey("gestation_services.id"), nullable=True)
    parto_programado_id = Column(
        Integer, ForeignKey("scheduled_farrowings.id"), nullable=True
    )

    tipo = Column(String(50), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha_objetivo = Column(Date, nullable=True)
    leida = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relaciones opcionales (útiles si luego haces joins)
    # empresa = relationship("Empresa")
    # granja = relationship("Granja")
    # sow = relationship("Sow")
    # servicio = relationship("GestationService")
    # parto_programado = relationship("ScheduledFarrowing")


# =========================
# ESQUEMAS Pydantic (API)
# =========================

class GestacionAlertaBase(BaseModel):
    empresa_id: int
    granja_id: int
    tipo: str = Field(..., max_length=50)
    mensaje: str
    fecha_objetivo: Optional[date] = None
    sow_id: Optional[int] = None
    servicio_id: Optional[int] = None
    parto_programado_id: Optional[int] = None
    leida: bool = False


class GestacionAlertaCreate(GestacionAlertaBase):
    pass


class GestacionAlertaUpdate(BaseModel):
    tipo: Optional[str] = Field(None, max_length=50)
    mensaje: Optional[str] = None
    fecha_objetivo: Optional[date] = None
    leida: Optional[bool] = None


class GestacionAlertaRead(GestacionAlertaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# REPOSITORIO / SERVICIO
# =========================

class GestacionAlertasRepository:
    """Capa de acceso a datos para alertas de gestación."""

    def __init__(self, db: Session):
        self.db = db

    # --- Lectura ---

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
        solo_pendientes: bool = False,
    ) -> List[GestacionAlerta]:
        query = (
            self.db.query(GestacionAlerta)
            .filter(
                GestacionAlerta.empresa_id == empresa_id,
                GestacionAlerta.granja_id == granja_id,
            )
            .order_by(GestacionAlerta.fecha_objetivo.is_(None), GestacionAlerta.fecha_objetivo)
        )
        if solo_pendientes:
            query = query.filter(GestacionAlerta.leida.is_(False))
        return query.all()

    def obtener_por_id(
        self, alerta_id: int, empresa_id: int, granja_id: int
    ) -> Optional[GestacionAlerta]:
        return (
            self.db.query(GestacionAlerta)
            .filter(
                GestacionAlerta.id == alerta_id,
                GestacionAlerta.empresa_id == empresa_id,
                GestacionAlerta.granja_id == granja_id,
            )
            .first()
        )

    # --- Escritura ---

    def crear(self, data: GestacionAlertaCreate) -> GestacionAlerta:
        alerta = GestacionAlerta(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            sow_id=data.sow_id,
            servicio_id=data.servicio_id,
            parto_programado_id=data.parto_programado_id,
            tipo=data.tipo,
            mensaje=data.mensaje,
            fecha_objetivo=data.fecha_objetivo,
            leida=data.leida,
        )
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def actualizar(
        self,
        alerta: GestacionAlerta,
        cambios: GestacionAlertaUpdate,
    ) -> GestacionAlerta:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(alerta, campo, valor)
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def marcar_leida(
        self,
        alerta: GestacionAlerta,
        leida: bool = True,
    ) -> GestacionAlerta:
        alerta.leida = leida
        self.db.add(alerta)
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def eliminar(self, alerta: GestacionAlerta) -> None:
        self.db.delete(alerta)
        self.db.commit()
