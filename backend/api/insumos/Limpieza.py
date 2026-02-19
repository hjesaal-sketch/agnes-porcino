# backend/api/insumos/Limpieza.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Limpieza import (
    ProductoLimpiezaRead,
    ProductoLimpiezaCreate,
    ProductoLimpiezaUpdate,
    ProductoLimpiezaRepository,
)

router = APIRouter(
    prefix="/insumos/limpieza", tags=["Insumos - Limpieza"]
)


def get_repo(db: Session = Depends(get_db)) -> ProductoLimpiezaRepository:
    return ProductoLimpiezaRepository(db)


@router.get(
    "/",
    response_model=List[ProductoLimpiezaRead],
    summary="Listar productos de limpieza por granja",
)
def listar_productos_limpieza(
    empresa_id: int,
    granja_id: int,
    repo: ProductoLimpiezaRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ProductoLimpiezaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar producto de limpieza",
)
def crear_producto_limpieza(
    payload: ProductoLimpiezaCreate,
    repo: ProductoLimpiezaRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{prod_id}",
    response_model=ProductoLimpiezaRead,
    summary="Actualizar producto de limpieza",
)
def actualizar_producto_limpieza(
    prod_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ProductoLimpiezaUpdate,
    repo: ProductoLimpiezaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(prod_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto de limpieza no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{prod_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar producto de limpieza",
)
def eliminar_producto_limpieza(
    prod_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ProductoLimpiezaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(prod_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto de limpieza no encontrado",
        )
    repo.eliminar(reg)
