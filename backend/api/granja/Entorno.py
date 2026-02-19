# backend/api/granja/Entorno.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Entorno import (
    EventoEntornoRepository,
    EventoEntornoRead,
    EventoEntornoCreate,
    EventoEntornoUpdate,
)

router = APIRouter(
    prefix="/granja/entorno",
    tags=["Granja - Entorno"],
)


def get_repo(db: Session = Depends(get_db)) -> EventoEntornoRepository:
    return EventoEntornoRepository(db)


@router.get(
    "/",
    response_model=List[EventoEntornoRead],
    summary="Listar eventos de entorno de la granja",
)
def listar_eventos_entorno(
    empresa_id: int,
    granja_id: int,
    repo: EventoEntornoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=EventoEntornoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de entorno",
)
def crear_evento_entorno(
    payload: EventoEntornoCreate,
    repo: EventoEntornoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{evento_id}",
    response_model=EventoEntornoRead,
    summary="Actualizar evento de entorno",
)
def actualizar_evento_entorno(
    evento_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: EventoEntornoUpdate,
    repo: EventoEntornoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(evento_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de entorno no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{evento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de entorno",
)
def eliminar_evento_entorno(
    evento_id: int,
    empresa_id: int,
    granja_id: int,
    repo: EventoEntornoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(evento_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de entorno no encontrado",
        )
    repo.eliminar(reg)
