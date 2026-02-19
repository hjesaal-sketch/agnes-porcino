# backend/api/gestacion/Madres.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Madres import (
    MadreCreate,
    MadreRead,
    MadreUpdate,
    MadresRepository,
)
from backend.validators.estado_animal import EstadoAnimalError

router = APIRouter(prefix="/gestacion/madres", tags=["Gestación - Madres"])


def get_repo(db: Session = Depends(get_db)) -> MadresRepository:
  return MadresRepository(db)


@router.get(
    "/",
    response_model=list[MadreRead],
    summary="Listar madres por granja",
)
def listar_madres(
    granja_id: int,
    repo: MadresRepository = Depends(get_repo),
):
    return repo.listar_por_granja(granja_id)


@router.post(
    "/",
    response_model=MadreRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear madre",
)
def crear_madre(
    payload: MadreCreate,
    repo: MadresRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put(
    "/{madre_id}",
    response_model=MadreRead,
    summary="Actualizar madre",
)
def actualizar_madre(
    madre_id: int,
    granja_id: int,
    cambios: MadreUpdate,
    repo: MadresRepository = Depends(get_repo),
):
    madre = repo.obtener_por_id(madre_id, granja_id)
    if not madre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Madre no encontrada",
        )
    try:
        return repo.actualizar(madre, cambios)
    except EstadoAnimalError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


class BajaMadrePayload(BaseModel):
    causa_baja: str


@router.post(
    "/{madre_id}/baja",
    response_model=MadreRead,
    summary="Dar de baja madre (descarte)",
)
def dar_baja_madre(
    madre_id: int,
    granja_id: int,
    payload: BajaMadrePayload,
    repo: MadresRepository = Depends(get_repo),
):
    madre = repo.obtener_por_id(madre_id, granja_id)
    if not madre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Madre no encontrada",
        )

    try:
        return repo.dar_baja(madre, payload.causa_baja)
    except EstadoAnimalError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete(
    "/{madre_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar madre",
)
def eliminar_madre(
    madre_id: int,
    granja_id: int,
    repo: MadresRepository = Depends(get_repo),
):
    madre = repo.obtener_por_id(madre_id, granja_id)
    if not madre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Madre no encontrada",
        )
    repo.eliminar(madre)
