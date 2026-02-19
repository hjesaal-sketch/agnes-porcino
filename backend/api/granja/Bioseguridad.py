# backend/api/granja/Bioseguridad.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Bioseguridad import (
    EventoBioseguridadRead,
    EventoBioseguridadCreate,
    EventoBioseguridadUpdate,
    EventoBioseguridadRepository,
)

router = APIRouter(
    prefix="/granja/bioseguridad", tags=["Granja - Bioseguridad"]
)


def get_repo(db: Session = Depends(get_db)) -> EventoBioseguridadRepository:
    return EventoBioseguridadRepository(db)


@router.get(
    "/",
    response_model=List[EventoBioseguridadRead],
    summary="Listar eventos de bioseguridad por granja",
)
def listar_eventos(
    empresa_id: int,
    granja_id: int,
    repo: EventoBioseguridadRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=EventoBioseguridadRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de bioseguridad",
)
def crear_evento(
    payload: EventoBioseguridadCreate,
    repo: EventoBioseguridadRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{evento_id}",
    response_model=EventoBioseguridadRead,
    summary="Actualizar evento de bioseguridad",
)
def actualizar_evento(
    evento_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: EventoBioseguridadUpdate,
    repo: EventoBioseguridadRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(evento_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de bioseguridad no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{evento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de bioseguridad",
)
def eliminar_evento(
    evento_id: int,
    empresa_id: int,
    granja_id: int,
    repo: EventoBioseguridadRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(evento_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de bioseguridad no encontrado",
        )
    repo.eliminar(reg)
