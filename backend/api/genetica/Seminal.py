# backend/api/genetica/Seminal.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.genetica.Seminal import (
    SeminalRepository,
    RegistroSeminalRead,
    RegistroSeminalCreate,
    RegistroSeminalUpdate,
)

router = APIRouter(
    prefix="/genetica/seminal",
    tags=["Genética - Seminal"],
)


def get_repo(db: Session = Depends(get_db)) -> SeminalRepository:
    return SeminalRepository(db)


@router.get(
    "/",
    response_model=List[RegistroSeminalRead],
    summary="Listar registros seminales",
)
def listar_seminal(
    empresa_id: int,
    granja_id: int,
    repo: SeminalRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=RegistroSeminalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar muestra seminal",
)
def crear_seminal(
    payload: RegistroSeminalCreate,
    repo: SeminalRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=RegistroSeminalRead,
    summary="Actualizar muestra seminal",
)
def actualizar_seminal(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: RegistroSeminalUpdate,
    repo: SeminalRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro seminal no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar muestra seminal",
)
def eliminar_seminal(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: SeminalRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro seminal no encontrado",
        )
    repo.eliminar(reg)
