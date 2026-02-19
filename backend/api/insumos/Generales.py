from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Generales import (
    InsumoGeneralRead,
    InsumoGeneralCreate,
    InsumoGeneralUpdate,
    InsumoGeneralRepository,
)
from backend.validators.insumos_generales_validators import (
    InsumoGeneralValidationError,
)

router = APIRouter(
    prefix="/insumos/generales", tags=["Insumos - Generales"]
)


def get_repo(db: Session = Depends(get_db)) -> InsumoGeneralRepository:
    return InsumoGeneralRepository(db)


@router.get(
    "/",
    response_model=List[InsumoGeneralRead],
    summary="Listar insumos generales por granja",
)
def listar_generales(
    empresa_id: int,
    granja_id: int,
    repo: InsumoGeneralRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=InsumoGeneralRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar insumo general",
)
def crear_insumo_general(
    payload: InsumoGeneralCreate,
    repo: InsumoGeneralRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except InsumoGeneralValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.put(
    "/{insumo_id}",
    response_model=InsumoGeneralRead,
    summary="Actualizar insumo general",
)
def actualizar_insumo_general(
    insumo_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: InsumoGeneralUpdate,
    repo: InsumoGeneralRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(insumo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo general no encontrado",
        )
    try:
        return repo.actualizar(reg, cambios)
    except InsumoGeneralValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.delete(
    "/{insumo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar insumo general",
)
def eliminar_insumo_general(
    insumo_id: int,
    empresa_id: int,
    granja_id: int,
    repo: InsumoGeneralRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(insumo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insumo general no encontrado",
        )
    repo.eliminar(reg)
