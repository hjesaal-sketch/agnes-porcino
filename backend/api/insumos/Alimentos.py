# backend/api/insumos/Alimentos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Alimentos import (
    AlimentoRead,
    AlimentoCreate,
    AlimentoUpdate,
    AlimentoRepository,
)
from backend.validators.insumos_alimentos_validators import AlimentoValidationError

router = APIRouter(prefix="/insumos/alimentos", tags=["Insumos - Alimentos"])


def get_repo(db: Session = Depends(get_db)) -> AlimentoRepository:
    return AlimentoRepository(db)


@router.get(
    "/",
    response_model=List[AlimentoRead],
    summary="Listar alimentos por granja",
)
def listar_alimentos(
    empresa_id: int,
    granja_id: int,
    repo: AlimentoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=AlimentoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar alimento",
)
def crear_alimento(
    payload: AlimentoCreate,
    repo: AlimentoRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except AlimentoValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.put(
    "/{alimento_id}",
    response_model=AlimentoRead,
    summary="Actualizar alimento",
)
def actualizar_alimento(
    alimento_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: AlimentoUpdate,
    repo: AlimentoRepository = Depends(get_repo),
):
    alimento = repo.obtener_por_id(alimento_id, empresa_id, granja_id)
    if not alimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alimento no encontrado",
        )
    try:
        return repo.actualizar(alimento, cambios)
    except AlimentoValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.delete(
    "/{alimento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar alimento",
)
def eliminar_alimento(
    alimento_id: int,
    empresa_id: int,
    granja_id: int,
    repo: AlimentoRepository = Depends(get_repo),
):
    alimento = repo.obtener_por_id(alimento_id, empresa_id, granja_id)
    if not alimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alimento no encontrado",
        )
    repo.eliminar(alimento)
