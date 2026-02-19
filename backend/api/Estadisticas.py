# backend/api/Estadisticas.py

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.Estadisticas import (
    EstadisticasRepository,
    IndicadorEstadisticaRead,
    IndicadorEstadisticaCreate,
    ResumenMensualRead,
    ResumenMensualCreate,
    ResumenGlobalRead,
    ResumenGlobalCreate,
)

router = APIRouter(
    prefix="/estadisticas",
    tags=["Estadísticas"],
)


def get_repo(db: Session = Depends(get_db)) -> EstadisticasRepository:
    return EstadisticasRepository(db)


# Indicadores

@router.get(
    "/indicadores",
    response_model=List[IndicadorEstadisticaRead],
    summary="Listar indicadores de estadísticas",
)
def listar_indicadores(
    empresa_id: int,
    granja_id: int,
    categoria: Optional[str] = None,
    repo: EstadisticasRepository = Depends(get_repo),
):
    return repo.listar_indicadores(empresa_id, granja_id, categoria)


@router.post(
    "/indicadores",
    response_model=IndicadorEstadisticaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear indicador de estadística",
)
def crear_indicador(
    payload: IndicadorEstadisticaCreate,
    repo: EstadisticasRepository = Depends(get_repo),
):
    return repo.crear_indicador(payload)


# Resumen mensual

@router.get(
    "/resumen-mensual",
    response_model=List[ResumenMensualRead],
    summary="Listar resumen mensual",
)
def listar_resumen_mensual(
    empresa_id: int,
    granja_id: int,
    repo: EstadisticasRepository = Depends(get_repo),
):
    return repo.listar_resumen_mensual(empresa_id, granja_id)


@router.post(
    "/resumen-mensual",
    response_model=ResumenMensualRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear resumen mensual",
)
def crear_resumen_mensual(
    payload: ResumenMensualCreate,
    repo: EstadisticasRepository = Depends(get_repo),
):
    return repo.crear_resumen_mensual(payload)


# Resumen global

@router.get(
    "/resumen-global",
    response_model=ResumenGlobalRead,
    summary="Obtener resumen global",
)
def obtener_resumen_global(
    empresa_id: int,
    granja_id: int,
    repo: EstadisticasRepository = Depends(get_repo),
):
    resumen = repo.obtener_resumen_global(empresa_id, granja_id)

    if not resumen:
        ahora = datetime.utcnow()
        return ResumenGlobalRead(
            id=0,
            empresa_id=empresa_id,
            granja_id=granja_id,
            periodo_meses=12,
            total_partos=0,
            total_destetados=0,
            mortalidad_promedio="0.0",  # ← AQUÍ COMO STRING
            partos_ultimos_12_meses=0,
            lechones_destetados_ultimos_12_meses=0,
            mortalidad_total_ultimos_12_meses=0.0,
            created_at=ahora,
            updated_at=ahora,
        )

    return resumen

@router.post(
    "/resumen-global",
    response_model=ResumenGlobalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear o actualizar resumen global",
)
def crear_actualizar_resumen_global(
    payload: ResumenGlobalCreate,
    repo: EstadisticasRepository = Depends(get_repo),
):
    return repo.actualizar_resumen_global(
        payload.empresa_id, payload.granja_id, payload
    )
