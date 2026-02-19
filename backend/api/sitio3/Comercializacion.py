# backend/api/sitio3/Comercializacion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Comercializacion import (
    ComercializacionS3Repository,
    ComercializacionS3Read,
    ComercializacionS3Create,
    ComercializacionS3Update,
)

router = APIRouter(
    prefix="/sitio3/comercializacion",
    tags=["Sitio 3 - Comercialización"],
)


def get_repo(db: Session = Depends(get_db)) -> ComercializacionS3Repository:
    return ComercializacionS3Repository(db)


@router.get(
    "/",
    response_model=List[ComercializacionS3Read],
    summary="Listar ventas/salidas Sitio 3",
)
def listar_ventas_s3(
    empresa_id: int,
    granja_id: int,
    repo: ComercializacionS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ComercializacionS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar venta/salida Sitio 3",
)
def crear_venta_s3(
    payload: ComercializacionS3Create,
    repo: ComercializacionS3Repository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=ComercializacionS3Read,
    summary="Actualizar venta/salida Sitio 3",
)
def actualizar_venta_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ComercializacionS3Update,
    repo: ComercializacionS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de comercialización Sitio 3 no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar venta/salida Sitio 3",
)
def eliminar_venta_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ComercializacionS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de comercialización Sitio 3 no encontrado",
        )
    repo.eliminar(reg)
