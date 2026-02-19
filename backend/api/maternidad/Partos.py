# backend/api/maternidad/Partos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Partos import (
    PartoRead,
    PartoCreate,
    PartoUpdate,
    PartoRepository,
)
from backend.validators.maternidad_validators import MaternidadValidationError

router = APIRouter(prefix="/maternidad/partos", tags=["Maternidad - Partos"])


def get_repo(db: Session = Depends(get_db)) -> PartoRepository:
    return PartoRepository(db)


@router.get(
    "/",
    response_model=List[PartoRead],
    summary="Listar partos de maternidad por granja",
)
def listar_partos(
    empresa_id: int,
    granja_id: int,
    repo: PartoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=PartoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar parto de maternidad",
)
def crear_parto(
    payload: PartoCreate,
    repo: PartoRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except MaternidadValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.put(
    "/{parto_id}",
    response_model=PartoRead,
    summary="Actualizar parto de maternidad",
)
def actualizar_parto(
    parto_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: PartoUpdate,
    repo: PartoRepository = Depends(get_repo),
):
    parto = repo.obtener_por_id(parto_id, empresa_id, granja_id)
    if not parto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parto de maternidad no encontrado",
        )

    try:
        return repo.actualizar(parto, cambios)
    except MaternidadValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.delete(
    "/{parto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar parto de maternidad",
)
def eliminar_parto(
    parto_id: int,
    empresa_id: int,
    granja_id: int,
    repo: PartoRepository = Depends(get_repo),
):
    parto = repo.obtener_por_id(parto_id, empresa_id, granja_id)
    if not parto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parto de maternidad no encontrado",
        )
    repo.eliminar(parto)
