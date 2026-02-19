# backend/api/gestacion/KPIs.py
from datetime import date
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.KPIs import GestacionKPIsService

router = APIRouter(prefix="/gestacion/kpis", tags=["Gestación - KPIs"])


def get_service(db: Session = Depends(get_db)) -> GestacionKPIsService:
    return GestacionKPIsService(db)


@router.get(
    "/basicos",
    response_model=Dict[str, Any],
    summary="KPIs básicos de gestación por granja",
)
def kpis_basicos(
    granja_id: int,
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    service: GestacionKPIsService = Depends(get_service),
):
    desde_date = date.fromisoformat(desde) if desde else None
    hasta_date = date.fromisoformat(hasta) if hasta else None
    return service.kpis_basicos(granja_id=granja_id, desde=desde_date, hasta=hasta_date)
