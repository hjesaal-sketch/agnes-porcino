# backend/api/granja/Infraestructura.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Infraestructura import (
    ZonaGranjaRepository,
    ZonaGranjaRead,
    ZonaGranjaCreate,
    ZonaGranjaUpdate,
)

router = APIRouter(
    prefix="/granja/infraestructura",
    tags=["Granja - Infraestructura"],
)


def get_repo(db: Session = Depends(get_db)) -> ZonaGranjaRepository:
    return ZonaGranjaRepository(db)


@router.get(
    "/",
    response_model=List[ZonaGranjaRead],
    summary="Listar zonas de la granja",
)
def listar_zonas(
    empresa_id: int,
    granja_id: int,
    repo: ZonaGranjaRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ZonaGranjaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar zona de la granja",
)
def crear_zona(
    payload: ZonaGranjaCreate,
    repo: ZonaGranjaRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{zona_id}",
    response_model=ZonaGranjaRead,
    summary="Actualizar zona de la granja",
)
def actualizar_zona(
    zona_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ZonaGranjaUpdate,
    repo: ZonaGranjaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(zona_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zona de granja no encontrada",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{zona_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar zona de la granja",
)
def eliminar_zona(
    zona_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ZonaGranjaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(zona_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Zona de granja no encontrada",
        )
    repo.eliminar(reg)
