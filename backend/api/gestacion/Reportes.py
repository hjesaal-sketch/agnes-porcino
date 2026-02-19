# backend/api/gestacion/Reportes.py
from datetime import date
from typing import Optional, Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Reportes import GestacionReportesService

router = APIRouter(prefix="/gestacion/reportes", tags=["Gestación - Reportes"])


def get_service(db: Session = Depends(get_db)) -> GestacionReportesService:
    return GestacionReportesService(db)


@router.get(
    "/resumen",
    summary="Obtener resumen completo de gestación",
    response_model=Dict[str, Any],
)
def resumen_gestacion(
    empresa_id: int,
    granja_id: int,
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    service: GestacionReportesService = Depends(get_service),
):
    desde_date = date.fromisoformat(desde) if desde else None
    hasta_date = date.fromisoformat(hasta) if hasta else None

    return service.resumen_completo(
        empresa_id=empresa_id,
        granja_id=granja_id,
        desde=desde_date,
        hasta=hasta_date,
    )
