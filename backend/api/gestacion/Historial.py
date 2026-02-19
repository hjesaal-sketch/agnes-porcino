# backend/api/gestacion/Historial.py
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Historial import (
    EventoGestacionCreate,
    EventoGestacionRead,
    HistorialGestacionRepository,
)

router = APIRouter(
    prefix="/gestacion/historial",
    tags=["Gestación - Historial"],
)


def get_repo(db: Session = Depends(get_db)) -> HistorialGestacionRepository:
  return HistorialGestacionRepository(db)


@router.get(
    "/",
    response_model=List[EventoGestacionRead],
    summary="Listar historial de gestación",
)
def listar_historial(
    granja_id: int,
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    tipo_evento: Optional[str] = None,
    repo: HistorialGestacionRepository = Depends(get_repo),
):
    desde_date: Optional[date] = None
    hasta_date: Optional[date] = None

    if desde:
        desde_date = date.fromisoformat(desde)
    if hasta:
        hasta_date = date.fromisoformat(hasta)

    return repo.listar(
        granja_id=granja_id,
        desde=desde_date,
        hasta=hasta_date,
        tipo_evento=tipo_evento,
    )


@router.post(
    "/",
    response_model=EventoGestacionRead,
    summary="Registrar evento de gestación en historial",
)
def registrar_evento(
    payload: EventoGestacionCreate,
    repo: HistorialGestacionRepository = Depends(get_repo),
):
    return repo.registrar_evento(payload)


@router.put(
    "/{evento_id}",
    response_model=EventoGestacionRead,
    summary="Actualizar evento de historial de gestación",
)
def actualizar_evento(
    evento_id: int,
    payload: EventoGestacionCreate,
    repo: HistorialGestacionRepository = Depends(get_repo),
):
    evento = repo.obtener_por_id(evento_id)
    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de historial no encontrado",
        )

    evento_actualizado = repo.actualizar(evento, payload)
    return evento_actualizado


@router.delete(
    "/{evento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de historial de gestación",
)
def eliminar_evento(
    evento_id: int,
    repo: HistorialGestacionRepository = Depends(get_repo),
):
    evento = repo.obtener_por_id(evento_id)
    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de historial no encontrado",
        )

    repo.eliminar(evento)
