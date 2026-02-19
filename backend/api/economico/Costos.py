# backend/api/EconomicoCostos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.economico.Costos import (
    CostoEconomicoModel,
    CostoRepository,
    CostoRead,
    CostoCreate,
    CostoUpdate,
)

router = APIRouter(
    prefix="/economico/costos",
    tags=["Económico - Costos"],
)


def get_repo(db: Session = Depends(get_db)) -> CostoRepository:
    return CostoRepository(db)


@router.get(
    "/",
    response_model=List[CostoRead],
    summary="Listar costos económicos",
)
def listar_costos(
    empresa_id: int,
    granja_id: int,
    repo: CostoRepository = Depends(get_repo),
):
    return repo.listar(empresa_id, granja_id)


@router.post(
    "/",
    response_model=CostoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear costo económico",
)
def crear_costo(
    payload: CostoCreate,
    repo: CostoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{costo_id}",
    response_model=CostoRead,
    summary="Actualizar costo económico",
)
def actualizar_costo(
    costo_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: CostoUpdate,
    repo: CostoRepository = Depends(get_repo),
):
    reg = repo.obtener(costo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Costo económico no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{costo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar costo económico",
)
def eliminar_costo(
    costo_id: int,
    empresa_id: int,
    granja_id: int,
    repo: CostoRepository = Depends(get_repo),
):
    reg = repo.obtener(costo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Costo económico no encontrado",
        )
    repo.eliminar(reg)
