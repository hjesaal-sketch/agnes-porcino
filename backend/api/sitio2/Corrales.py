# backend/api/sitio2/Corrales.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Corrales import (
    CorralesRepository,
    CorralRead,
    CorralCreate,
    CorralUpdate,
)

router = APIRouter(
    prefix="/sitio2/corrales",
    tags=["Sitio 2 - Corrales"],
)


def get_repo(db: Session = Depends(get_db)) -> CorralesRepository:
    return CorralesRepository(db)


@router.get(
    "/",
    response_model=List[CorralRead],
    summary="Listar corrales Sitio 2",
)
def listar_corrales(
    empresa_id: int,
    granja_id: int,
    repo: CorralesRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=CorralRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar corral",
)
def crear_corral(
    payload: CorralCreate,
    repo: CorralesRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{corral_id}",
    response_model=CorralRead,
    summary="Actualizar corral",
)
def actualizar_corral(
    corral_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: CorralUpdate,
    repo: CorralesRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(corral_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corral no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{corral_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar corral",
)
def eliminar_corral(
    corral_id: int,
    empresa_id: int,
    granja_id: int,
    repo: CorralesRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(corral_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corral no encontrado",
        )
    repo.eliminar(reg)
