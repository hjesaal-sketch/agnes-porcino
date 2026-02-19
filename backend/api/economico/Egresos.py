# backend/api/economico/Egresos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.economico.Egresos import (
    EgresoRepository,
    EgresoRead,
    EgresoCreate,
    EgresoUpdate,
)

router = APIRouter(
    prefix="/economico/egresos",
    tags=["Económico - Egresos"],
)


def get_repo(db: Session = Depends(get_db)) -> EgresoRepository:
    return EgresoRepository(db)


@router.get(
    "/",
    response_model=List[EgresoRead],
    summary="Listar egresos económicos",
)
def listar_egresos(
    empresa_id: int,
    granja_id: int,
    repo: EgresoRepository = Depends(get_repo),
):
    return repo.listar(empresa_id, granja_id)


@router.post(
    "/",
    response_model=EgresoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear egreso económico",
)
def crear_egreso(
    payload: EgresoCreate,
    repo: EgresoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{egreso_id}",
    response_model=EgresoRead,
    summary="Actualizar egreso económico",
)
def actualizar_egreso(
    egreso_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: EgresoUpdate,
    repo: EgresoRepository = Depends(get_repo),
):
    reg = repo.obtener(egreso_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egreso económico no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{egreso_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar egreso económico",
)
def eliminar_egreso(
    egreso_id: int,
    empresa_id: int,
    granja_id: int,
    repo: EgresoRepository = Depends(get_repo),
):
    reg = repo.obtener(egreso_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egreso económico no encontrado",
        )
    repo.eliminar(reg)
