# backend/models/gestacion/KPIs.py
from datetime import date
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.gestacion.Servicios import ServicioGestacion
from backend.models.gestacion.Partos import PartoProgramado
from backend.models.gestacion.Historial import EventoGestacion


class GestacionKPIsService:
    """Cálculo de KPIs de gestación para una granja."""

    def __init__(self, db: Session):
        self.db = db

    def kpis_basicos(
        self,
        granja_id: int,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ) -> Dict[str, Any]:
        # Filtro base por fechas en servicios
        servicios_q = self.db.query(ServicioGestacion).filter(
            ServicioGestacion.granja_id == granja_id
        )
        if desde:
            servicios_q = servicios_q.filter(ServicioGestacion.fecha >= desde)
        if hasta:
            servicios_q = servicios_q.filter(ServicioGestacion.fecha <= hasta)

        total_servicios = servicios_q.count()

        gestantes = (
            servicios_q.filter(ServicioGestacion.resultado == "Gestante").count()
            if total_servicios > 0
            else 0
        )
        vacias = (
            servicios_q.filter(ServicioGestacion.resultado == "Vacía").count()
            if total_servicios > 0
            else 0
        )

        tasa_gestacion = (
            gestantes / total_servicios * 100 if total_servicios > 0 else 0.0
        )
        tasa_fallas = 100 - tasa_gestacion if total_servicios > 0 else 0.0

        # Partos programados realizados en rango
        partos_q = self.db.query(PartoProgramado).filter(
            PartoProgramado.granja_id == granja_id,
            PartoProgramado.realizado.is_(True),
        )
        if desde:
            partos_q = partos_q.filter(PartoProgramado.fecha_probable >= desde)
        if hasta:
            partos_q = partos_q.filter(PartoProgramado.fecha_probable <= hasta)

        total_partos_realizados = partos_q.count()

        # Eventos de historial por tipo
        historial_q = self.db.query(EventoGestacion).filter(
            EventoGestacion.granja_id == granja_id
        )
        if desde:
            historial_q = historial_q.filter(EventoGestacion.fecha_evento >= desde)
        if hasta:
            historial_q = historial_q.filter(EventoGestacion.fecha_evento <= hasta)

        servicios_con_resultado = (
            historial_q.filter(
                EventoGestacion.tipo_evento == "SERVICIO_RESULTADO"
            ).count()
        )

        # Por ahora devolvemos KPIs básicos; luego puedes enriquecer con más métricas
        return {
            "total_servicios": total_servicios,
            "servicios_gestantes": gestantes,
            "servicios_vacias": vacias,
            "tasa_gestacion": round(tasa_gestacion, 2),
            "tasa_fallas": round(tasa_fallas, 2),
            "total_partos_realizados": total_partos_realizados,
            "servicios_con_resultado": servicios_con_resultado,
        }
