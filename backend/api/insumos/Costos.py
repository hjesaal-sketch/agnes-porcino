# backend/api/insumos/Costos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Costos import (
    CostoRead,
    CostoCreate,
    CostoUpdate,
    CostoInsumoRepository,
)

router = APIRouter(prefix="/insumos/costos", tags=["Insumos - Costos"])


def get_repo(db: Session = Depends(get_db)) -> CostoInsumoRepository:
  return CostoInsumoRepository(db)


@router.get(
    "/",
    response_model=List[CostoRead],
    summary="Listar costos de insumos por granja",
)
def listar_costos(
    empresa_id: int,
    granja_id: int,
    repo: CostoInsumoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=CostoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar costo de insumo",
)
def crear_costo(
    payload: CostoCreate,
    repo: CostoInsumoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{costo_id}",
    response_model=CostoRead,
    summary="Actualizar costo de insumo",
)
def actualizar_costo(
    costo_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: CostoUpdate,
    repo: CostoInsumoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(costo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de costo no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{costo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar costo de insumo",
)
def eliminar_costo(
    costo_id: int,
    empresa_id: int,
    granja_id: int,
    repo: CostoInsumoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(costo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de costo no encontrado",
        )
    repo.eliminar(reg)
