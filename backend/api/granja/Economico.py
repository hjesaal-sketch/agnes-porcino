# backend/api/granja/Economico.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Economico import (
    MovimientoEconomicoRepository,
    MovimientoEconomicoRead,
    MovimientoEconomicoCreate,
    MovimientoEconomicoUpdate,
)

router = APIRouter(
    prefix="/granja/economico",
    tags=["Granja - Económico"],
)


def get_repo(db: Session = Depends(get_db)) -> MovimientoEconomicoRepository:
    return MovimientoEconomicoRepository(db)


@router.get(
    "/",
    response_model=List[MovimientoEconomicoRead],
    summary="Listar movimientos económicos de la granja",
)
def listar_movimientos(
    empresa_id: int,
    granja_id: int,
    repo: MovimientoEconomicoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=MovimientoEconomicoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar movimiento económico",
)
def crear_movimiento(
    payload: MovimientoEconomicoCreate,
    repo: MovimientoEconomicoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{mov_id}",
    response_model=MovimientoEconomicoRead,
    summary="Actualizar movimiento económico",
)
def actualizar_movimiento(
    mov_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MovimientoEconomicoUpdate,
    repo: MovimientoEconomicoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(mov_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimiento económico no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{mov_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar movimiento económico",
)
def eliminar_movimiento(
    mov_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MovimientoEconomicoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(mov_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimiento económico no encontrado",
        )
    repo.eliminar(reg)
