# backend/models/gestacion/Reportes.py
from datetime import date
from typing import Optional, Dict, Any, List

from sqlalchemy.orm import Session

from backend.models.gestacion.Madres import Madre
from backend.models.gestacion.Servicios import ServicioGestacion
from backend.models.gestacion.Partos import PartoProgramado
from backend.models.gestacion.Historial import EventoGestacion
from backend.models.gestacion.Alertas import GestacionAlerta
from backend.models.gestacion.KPIs import GestacionKPIsService


class GestacionReportesService:
    """Construye estructuras de reporte completas para gestación."""

    def __init__(self, db: Session):
        self.db = db

    def _filtrar_por_rango_fecha_servicios(
        self,
        granja_id: int,
        desde: Optional[date],
        hasta: Optional[date],
    ) -> List[ServicioGestacion]:
        q = self.db.query(ServicioGestacion).filter(
            ServicioGestacion.granja_id == granja_id
        )
        if desde:
            q = q.filter(ServicioGestacion.fecha >= desde)
        if hasta:
            q = q.filter(ServicioGestacion.fecha <= hasta)
        return q.all()

    def _filtrar_por_rango_fecha_partos(
        self,
        granja_id: int,
        desde: Optional[date],
        hasta: Optional[date],
    ) -> List[PartoProgramado]:
        q = self.db.query(PartoProgramado).filter(
            PartoProgramado.granja_id == granja_id
        )
        if desde:
            q = q.filter(PartoProgramado.fecha_probable >= desde)
        if hasta:
            q = q.filter(PartoProgramado.fecha_probable <= hasta)
        return q.all()

    def resumen_completo(
        self,
        empresa_id: int,
        granja_id: int,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ) -> Dict[str, Any]:
        # Madres de la granja
        madres = (
            self.db.query(Madre)
            .filter(Madre.granja_id == granja_id)
            .order_by(Madre.identificacion)
            .all()
        )

        servicios = self._filtrar_por_rango_fecha_servicios(granja_id, desde, hasta)
        partos = self._filtrar_por_rango_fecha_partos(granja_id, desde, hasta)

        historial_q = self.db.query(EventoGestacion).filter(
            EventoGestacion.empresa_id == empresa_id,
            EventoGestacion.granja_id == granja_id,
        )
        if desde:
            historial_q = historial_q.filter(EventoGestacion.fecha_evento >= desde)
        if hasta:
            historial_q = historial_q.filter(EventoGestacion.fecha_evento <= hasta)
        historial = historial_q.all()

        alertas = (
            self.db.query(GestacionAlerta)
            .filter(
                GestacionAlerta.empresa_id == empresa_id,
                GestacionAlerta.granja_id == granja_id,
            )
            .all()
        )

        kpi_service = GestacionKPIsService(self.db)
        kpis = kpi_service.kpis_basicos(granja_id=granja_id, desde=desde, hasta=hasta)

        return {
            "madres": madres,
            "servicios": servicios,
            "partos": partos,
            "historial": historial,
            "alertas": alertas,
            "kpis": kpis,
        }
