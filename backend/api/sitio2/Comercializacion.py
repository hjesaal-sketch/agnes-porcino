# backend/api/sitio2/Comercializacion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Comercializacion import (
    ComercializacionRepository,
    ComercializacionRead,
    ComercializacionCreate,
    ComercializacionUpdate,
)

router = APIRouter(
    prefix="/sitio2/comercializacion",
    tags=["Sitio 2 - Comercialización"],
)


def get_repo(db: Session = Depends(get_db)) -> ComercializacionRepository:
    return ComercializacionRepository(db)


@router.get(
    "/",
    response_model=List[ComercializacionRead],
    summary="Listar ventas/salidas de Sitio 2",
)
def listar_ventas(
    empresa_id: int,
    granja_id: int,
    repo: ComercializacionRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ComercializacionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar venta/salida",
)
def crear_venta(
    payload: ComercializacionCreate,
    repo: ComercializacionRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{venta_id}",
    response_model=ComercializacionRead,
    summary="Actualizar venta/salida",
)
def actualizar_venta(
    venta_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ComercializacionUpdate,
    repo: ComercializacionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(venta_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de comercialización no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{venta_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar venta/salida",
)
def eliminar_venta(
    venta_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ComercializacionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(venta_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de comercialización no encontrado",
        )
    repo.eliminar(reg)
