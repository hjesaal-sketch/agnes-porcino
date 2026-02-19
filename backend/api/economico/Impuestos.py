# backend/api/economico/Impuestos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.economico.Impuestos import (
    ImpuestoRepository,
    ImpuestoRead,
    ImpuestoCreate,
    ImpuestoUpdate,
)

router = APIRouter(
    prefix="/economico/impuestos",
    tags=["Económico - Impuestos"],
)


def get_repo(db: Session = Depends(get_db)) -> ImpuestoRepository:
    return ImpuestoRepository(db)


@router.get(
    "/",
    response_model=List[ImpuestoRead],
    summary="Listar impuestos económicos",
)
def listar_impuestos(
    empresa_id: int,
    granja_id: int,
    repo: ImpuestoRepository = Depends(get_repo),
):
    return repo.listar(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ImpuestoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear impuesto económico",
)
def crear_impuesto(
    payload: ImpuestoCreate,
    repo: ImpuestoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{imp_id}",
    response_model=ImpuestoRead,
    summary="Actualizar impuesto económico",
)
def actualizar_impuesto(
    imp_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ImpuestoUpdate,
    repo: ImpuestoRepository = Depends(get_repo),
):
    reg = repo.obtener(imp_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impuesto económico no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{imp_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar impuesto económico",
)
def eliminar_impuesto(
    imp_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ImpuestoRepository = Depends(get_repo),
):
    reg = repo.obtener(imp_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impuesto económico no encontrado",
        )
    repo.eliminar(reg)
