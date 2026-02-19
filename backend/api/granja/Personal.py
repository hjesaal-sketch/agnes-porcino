# backend/api/granja/Personal.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Personal import (
    PersonalRepository,
    PersonalGranjaRead,
    PersonalGranjaCreate,
    PersonalGranjaUpdate,
)

router = APIRouter(
    prefix="/granja/personal",
    tags=["Granja - Personal"],
)


def get_repo(db: Session = Depends(get_db)) -> PersonalRepository:
    return PersonalRepository(db)


@router.get(
    "/",
    response_model=List[PersonalGranjaRead],
    summary="Listar personal de la granja",
)
def listar_personal(
    empresa_id: int,
    granja_id: int,
    repo: PersonalRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=PersonalGranjaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar personal",
)
def crear_personal(
    payload: PersonalGranjaCreate,
    repo: PersonalRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{pers_id}",
    response_model=PersonalGranjaRead,
    summary="Actualizar personal",
)
def actualizar_personal(
    pers_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: PersonalGranjaUpdate,
    repo: PersonalRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(pers_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de personal no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{pers_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar personal",
)
def eliminar_personal(
    pers_id: int,
    empresa_id: int,
    granja_id: int,
    repo: PersonalRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(pers_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de personal no encontrado",
        )
    repo.eliminar(reg)
