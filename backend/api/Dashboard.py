# backend/api/Dashboard.py
from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.Dashboard import (
    DashboardRepository,
    IndicadorRead,
    IndicadorCreate,
    EventoTareaRead,
    EventoTareaCreate,
    ResumenReproductivoRead,
    ResumenReproductivoCreate,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_repo(db: Session = Depends(get_db)) -> DashboardRepository:
    return DashboardRepository(db)


# Indicadores
@router.get(
    "/indicadores",
    response_model=IndicadorRead,
    summary="Obtener indicadores del dashboard",
)
def obtener_indicadores(
    empresa_id: int,
    granja_id: int,
    repo: DashboardRepository = Depends(get_repo),
):
    indicadores = repo.obtener_indicadores(empresa_id, granja_id)
    if not indicadores:
        raise HTTPException(status_code=404, detail="Indicadores no encontrados")
    return indicadores


@router.post(
    "/indicadores",
    response_model=IndicadorRead,
    summary="Crear o actualizar indicadores",
)
def crear_actualizar_indicadores(
    payload: IndicadorCreate,
    repo: DashboardRepository = Depends(get_repo),
):
    return repo.crear_actualizar_indicadores(payload)


# Eventos y tareas
@router.get(
    "/eventos-tareas",
    response_model=List[EventoTareaRead],
    summary="Listar eventos y tareas pendientes",
)
def listar_eventos_tareas(
    empresa_id: int,
    granja_id: int,
    completado: bool = False,
    repo: DashboardRepository = Depends(get_repo),
):
    return repo.listar_eventos_tareas(empresa_id, granja_id, completado)


@router.post(
    "/eventos-tareas",
    response_model=EventoTareaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear evento o tarea",
)
def crear_evento_tarea(
    payload: EventoTareaCreate,
    repo: DashboardRepository = Depends(get_repo),
):
    return repo.crear_evento_tarea(payload)


@router.put(
    "/eventos-tareas/{id}/completar",
    response_model=EventoTareaRead,
    summary="Marcar evento como completado",
)
def marcar_completado(
    id: int,
    repo: DashboardRepository = Depends(get_repo),
):
    evento = repo.marcar_evento_completado(id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento


# Resumen reproductivo
@router.get(
    "/resumen-reproductivo",
    response_model=List[ResumenReproductivoRead],
    summary="Obtener resumen reproductivo mensual",
)
def listar_resumen_reproductivo(
    empresa_id: int,
    granja_id: int,
    repo: DashboardRepository = Depends(get_repo),
):
    return repo.listar_resumen_reproductivo(empresa_id, granja_id)


@router.post(
    "/resumen-reproductivo",
    response_model=ResumenReproductivoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear resumen reproductivo mensual",
)
def crear_resumen_reproductivo(
    payload: ResumenReproductivoCreate,
    repo: DashboardRepository = Depends(get_repo),
):
    return repo.crear_resumen_reproductivo(payload)
