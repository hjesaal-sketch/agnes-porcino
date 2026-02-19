# backend/api/sitio2/Crecimiento.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Crecimiento import (
    CrecimientoRepository,
    CrecimientoRead,
    CrecimientoCreate,
    CrecimientoUpdate,
)

router = APIRouter(
    prefix="/sitio2/crecimiento",
    tags=["Sitio 2 - Crecimiento"],
)


def get_repo(db: Session = Depends(get_db)) -> CrecimientoRepository:
    return CrecimientoRepository(db)


@router.get(
    "/",
    response_model=List[CrecimientoRead],
    summary="Listar registros de crecimiento/pesajes",
)
def listar_crecimiento(
    empresa_id: int,
    granja_id: int,
    repo: CrecimientoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=CrecimientoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar pesaje",
)
def crear_crecimiento(
    payload: CrecimientoCreate,
    repo: CrecimientoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=CrecimientoRead,
    summary="Actualizar pesaje",
)
def actualizar_crecimiento(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: CrecimientoUpdate,
    repo: CrecimientoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de crecimiento no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pesaje",
)
def eliminar_crecimiento(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: CrecimientoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de crecimiento no encontrado",
        )
    repo.eliminar(reg)
