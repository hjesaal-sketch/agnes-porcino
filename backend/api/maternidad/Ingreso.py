# backend/api/maternidad/Ingresos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Ingreso import (
    IngresoRead,
    IngresoCreate,
    IngresoUpdate,
    IngresoRepository,
)

router = APIRouter(prefix="/maternidad/ingreso", tags=["Maternidad - Ingreso"])


def get_repo(db: Session = Depends(get_db)) -> IngresoRepository:
    return IngresoRepository(db)


@router.get(
    "/",
    response_model=List[IngresoRead],
    summary="Listar ingresos de maternidad por granja",
)
def listar_ingresos(
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=IngresoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar ingreso a maternidad",
)
def crear_ingreso(
    payload: IngresoCreate,
    repo: IngresoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{ingreso_id}",
    response_model=IngresoRead,
    summary="Actualizar ingreso de maternidad",
)
def actualizar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: IngresoUpdate,
    repo: IngresoRepository = Depends(get_repo),
):
    ingreso = repo.obtener_por_id(ingreso_id, empresa_id, granja_id)
    if not ingreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso de maternidad no encontrado",
        )
    return repo.actualizar(ingreso, cambios)


@router.delete(
    "/{ingreso_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar ingreso de maternidad",
)
def eliminar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
    ingreso = repo.obtener_por_id(ingreso_id, empresa_id, granja_id)
    if not ingreso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso de maternidad no encontrado",
        )
    repo.eliminar(ingreso)
