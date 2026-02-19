# backend/api/granja/Servicios.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Servicios import (
    ServicioRepository,
    ServicioGranjaRead,
    ServicioGranjaCreate,
    ServicioGranjaUpdate,
)

router = APIRouter(
    prefix="/granja/servicios",
    tags=["Granja - Servicios"],
)


def get_repo(db: Session = Depends(get_db)) -> ServicioRepository:
    return ServicioRepository(db)


@router.get(
    "/",
    response_model=List[ServicioGranjaRead],
    summary="Listar servicios de la granja",
)
def listar_servicios(
    empresa_id: int,
    granja_id: int,
    repo: ServicioRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ServicioGranjaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar servicio",
)
def crear_servicio(
    payload: ServicioGranjaCreate,
    repo: ServicioRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{serv_id}",
    response_model=ServicioGranjaRead,
    summary="Actualizar servicio",
)
def actualizar_servicio(
    serv_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ServicioGranjaUpdate,
    repo: ServicioRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(serv_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{serv_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar servicio",
)
def eliminar_servicio(
    serv_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ServicioRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(serv_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    repo.eliminar(reg)
