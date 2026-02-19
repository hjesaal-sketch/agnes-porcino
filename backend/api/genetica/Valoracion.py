# backend/api/genetica/Valoracion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.genetica.Valoracion import (
    ValoracionRepository,
    ValoracionGeneticaRead,
    ValoracionGeneticaCreate,
    ValoracionGeneticaUpdate,
)

router = APIRouter(
    prefix="/genetica/valoraciones",
    tags=["Genética - Valoraciones"],
)


def get_repo(db: Session = Depends(get_db)) -> ValoracionRepository:
    return ValoracionRepository(db)


@router.get(
    "/",
    response_model=List[ValoracionGeneticaRead],
    summary="Listar valoraciones genéticas",
)
def listar_valoraciones(
    empresa_id: int,
    granja_id: int,
    repo: ValoracionRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ValoracionGeneticaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar valoración genética",
)
def crear_valoracion(
    payload: ValoracionGeneticaCreate,
    repo: ValoracionRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{val_id}",
    response_model=ValoracionGeneticaRead,
    summary="Actualizar valoración genética",
)
def actualizar_valoracion(
    val_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ValoracionGeneticaUpdate,
    repo: ValoracionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(val_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración genética no encontrada",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{val_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar valoración genética",
)
def eliminar_valoracion(
    val_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ValoracionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(val_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valoración genética no encontrada",
        )
    repo.eliminar(reg)
