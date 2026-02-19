# backend/models/gestacion/Historial.py
from __future__ import annotations

from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
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

class EventoGestacion(Base):
    __tablename__ = "gestation_history"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)
    sow_id = Column(Integer, ForeignKey("sows.id"), nullable=False)

    servicio_id = Column(Integer, ForeignKey("gestation_services.id"), nullable=True)
    parto_programado_id = Column(
        Integer, ForeignKey("scheduled_farrowings.id"), nullable=True
    )

    # Valores esperados: "Servicio", "Confirmación", "Parto", "Reinserción", "Baja", "Aborto", etc.
    tipo_evento = Column(String(50), nullable=False)
    fecha_evento = Column(Date, nullable=False)
    detalle = Column(Text)  # aquí puedes guardar JSON serializado si quieres más info

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Exponer idMadre para que Pydantic lo vea al serializar
    @property
    def idMadre(self) -> str:
        return str(self.sow_id)


# =========================
# ESQUEMAS Pydantic (API)
# =========================

class EventoGestacionBase(BaseModel):
    empresa_id: int
    granja_id: int
    idMadre: str = Field(..., max_length=50)
    tipo_evento: str  # incluirá "Aborto" como valor posible
    fecha_evento: date
    detalle: Optional[str] = None  # opcionalmente JSON en string
    servicio_id: Optional[int] = None
    parto_programado_id: Optional[int] = None


class EventoGestacionCreate(EventoGestacionBase):
    pass


class EventoGestacionRead(EventoGestacionBase):
    id: int
    sow_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic V1/V2 compat: antes orm_mode


# =========================
# REPOSITORIO
# =========================

class HistorialGestacionRepository:
    """Acceso a datos para historial de gestación."""

    def __init__(self, db: Session):
        self.db = db

    def _obtener_o_crear_madre(self, identificacion: str, granja_id: int) -> int:
        from backend.models.gestacion.Madres import Madre

        madre = (
            self.db.query(Madre)
            .filter(
                Madre.identificacion == identificacion,
                Madre.granja_id == granja_id,
            )
            .first()
        )
        if madre is None:
            madre = Madre(
                identificacion=identificacion,
                granja_id=granja_id,
            )
            self.db.add(madre)
            self.db.flush()
        return madre.id

    def _marcar_servicio_como_vacia_y_borrar_partos(
        self,
        sow_id: int,
        granja_id: int,
        servicio_id: Optional[int] = None,
    ) -> None:
        """
        Lógica de negocio para evento 'Aborto':
        - resultado del servicio => 'Vacía'
        - eliminar/desmarcar partos programados asociados.
        """
        from backend.models.gestacion.Servicios import ServicioGestacion
        from backend.models.gestacion.Partos import PartoProgramado

        # 1) Actualizar resultado del servicio
        q_servicio = self.db.query(ServicioGestacion).filter(
            ServicioGestacion.granja_id == granja_id,
            ServicioGestacion.sow_id == sow_id,
        )
        if servicio_id is not None:
            q_servicio = q_servicio.filter(ServicioGestacion.id == servicio_id)

        servicio = q_servicio.order_by(ServicioGestacion.fecha.desc()).first()
        if servicio is not None:
            servicio.resultado = "Vacía"
            self.db.add(servicio)

            # 2) Borrar partos programados ligados a ese servicio
            self.db.query(PartoProgramado).filter(
                PartoProgramado.granja_id == granja_id,
                PartoProgramado.sow_id == sow_id,
                PartoProgramado.servicio_id == servicio.id,
            ).delete(synchronize_session=False)

    def registrar_evento(self, data: EventoGestacionCreate) -> EventoGestacion:
        sow_id = self._obtener_o_crear_madre(
            identificacion=data.idMadre,
            granja_id=data.granja_id,
        )

        evento = EventoGestacion(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            sow_id=sow_id,
            servicio_id=data.servicio_id,
            parto_programado_id=data.parto_programado_id,
            tipo_evento=data.tipo_evento,
            fecha_evento=data.fecha_evento,
            detalle=data.detalle,
        )
        self.db.add(evento)

        # --- lógica específica para ABORTO ---
        if data.tipo_evento.lower() == "aborto":
            self._marcar_servicio_como_vacia_y_borrar_partos(
                sow_id=sow_id,
                granja_id=data.granja_id,
                servicio_id=data.servicio_id,
            )

        self.db.commit()
        self.db.refresh(evento)
        return evento

    def listar(
        self,
        granja_id: int,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
        tipo_evento: Optional[str] = None,
    ) -> List[EventoGestacion]:
        query = self.db.query(EventoGestacion).filter(
            EventoGestacion.granja_id == granja_id
        )
        if desde is not None:
            query = query.filter(EventoGestacion.fecha_evento >= desde)
        if hasta is not None:
            query = query.filter(EventoGestacion.fecha_evento <= hasta)
        if tipo_evento is not None:
            query = query.filter(EventoGestacion.tipo_evento == tipo_evento)

        return query.order_by(EventoGestacion.fecha_evento.desc()).all()

    # ===== nuevos métodos para PUT/DELETE =====

    def obtener_por_id(self, evento_id: int) -> Optional[EventoGestacion]:
        return (
            self.db.query(EventoGestacion)
            .filter(EventoGestacion.id == evento_id)
            .first()
        )

    def actualizar(
        self,
        evento: EventoGestacion,
        data: EventoGestacionCreate,
    ) -> EventoGestacion:
        # Actualizar sow_id según nueva madre (si cambia)
        sow_id = self._obtener_o_crear_madre(
            identificacion=data.idMadre,
            granja_id=data.granja_id,
        )

        evento.empresa_id = data.empresa_id
        evento.granja_id = data.granja_id
        evento.sow_id = sow_id
        evento.servicio_id = data.servicio_id
        evento.parto_programado_id = data.parto_programado_id
        evento.tipo_evento = data.tipo_evento
        evento.fecha_evento = data.fecha_evento
        evento.detalle = data.detalle

        # Lógica de aborto también en actualización
        if data.tipo_evento.lower() == "aborto":
            self._marcar_servicio_como_vacia_y_borrar_partos(
                sow_id=sow_id,
                granja_id=data.granja_id,
                servicio_id=data.servicio_id,
            )

        self.db.add(evento)
        self.db.commit()
        self.db.refresh(evento)
        return evento

    def eliminar(self, evento: EventoGestacion) -> None:
        self.db.delete(evento)
        self.db.commit()
