# backend/api/maternidad/Mortandad.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Mortandad import (
    MortalidadRead,
    MortalidadCreate,
    MortalidadUpdate,
    MortalidadRepository,
)

router = APIRouter(
    prefix="/maternidad/mortalidad", tags=["Maternidad - Mortalidad"]
)


def get_repo(db: Session = Depends(get_db)) -> MortalidadRepository:
    return MortalidadRepository(db)


@router.get(
    "/",
    response_model=List[MortalidadRead],
    summary="Listar registros de mortalidad en maternidad por granja",
)
def listar_mortalidad(
    empresa_id: int,
    granja_id: int,
    repo: MortalidadRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=MortalidadRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar mortalidad en maternidad",
)
def crear_mortalidad(
    payload: MortalidadCreate,
    repo: MortalidadRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{registro_id}",
    response_model=MortalidadRead,
    summary="Actualizar registro de mortalidad en maternidad",
)
def actualizar_mortalidad(
    registro_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MortalidadUpdate,
    repo: MortalidadRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(registro_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{registro_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar registro de mortalidad en maternidad",
)
def eliminar_mortalidad(
    registro_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MortalidadRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(registro_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad no encontrado",
        )
    repo.eliminar(reg)
