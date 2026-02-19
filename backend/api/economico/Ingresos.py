# backend/api/economico/Ingresos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.economico.Ingresos import (
    IngresoRepository,
    IngresoRead,
    IngresoCreate,
    IngresoUpdate,
)

router = APIRouter(
    prefix="/economico/ingresos",
    tags=["Económico - Ingresos"],
)


def get_repo(db: Session = Depends(get_db)) -> IngresoRepository:
    return IngresoRepository(db)


@router.get(
    "/",
    response_model=List[IngresoRead],
    summary="Listar ingresos económicos",
)
def listar_ingresos(
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
    return repo.listar(empresa_id, granja_id)


@router.post(
    "/",
    response_model=IngresoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear ingreso económico",
)
def crear_ingreso(
    payload: IngresoCreate,
    repo: IngresoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{ingreso_id}",
    response_model=IngresoRead,
    summary="Actualizar ingreso económico",
)
def actualizar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: IngresoUpdate,
    repo: IngresoRepository = Depends(get_repo),
):
    reg = repo.obtener(ingreso_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso económico no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{ingreso_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar ingreso económico",
)
def eliminar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
    reg = repo.obtener(ingreso_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso económico no encontrado",
        )
    repo.eliminar(reg)
