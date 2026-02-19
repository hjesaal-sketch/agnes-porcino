# backend/api/Productividad.py
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.Productividad import (
    ProductividadRepository,
    IndicadorProdRead,
    IndicadorProdCreate,
    IndicadorProdBase,
    HistorialProdRead,
    HistorialProdCreate,
)

router = APIRouter(
    prefix="/productividad",
    tags=["Productividad"],
)


def get_repo(db: Session = Depends(get_db)) -> ProductividadRepository:
    return ProductividadRepository(db)


# Indicadores
@router.get(
    "/indicadores",
    response_model=List[IndicadorProdRead],
    summary="Listar indicadores de productividad",
)
def listar_indicadores(
    empresa_id: int,
    granja_id: int,
    repo: ProductividadRepository = Depends(get_repo),
):
    return repo.listar_indicadores(empresa_id, granja_id)


@router.post(
    "/indicadores",
    response_model=IndicadorProdRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear indicador de productividad",
)
def crear_indicador(
    payload: IndicadorProdCreate,
    repo: ProductividadRepository = Depends(get_repo),
):
    return repo.crear_indicador(payload)


@router.put(
    "/indicadores/{id}",
    response_model=IndicadorProdRead,
    summary="Actualizar indicador de productividad",
)
def actualizar_indicador(
    id: int,
    payload: IndicadorProdBase,
    repo: ProductividadRepository = Depends(get_repo),
):
    updated = repo.actualizar_indicador(id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Indicador no encontrado")
    return updated


# Historial
@router.get(
    "/historial",
    response_model=List[HistorialProdRead],
    summary="Listar historial de productividad",
)
def listar_historial(
    empresa_id: int,
    granja_id: int,
    repo: ProductividadRepository = Depends(get_repo),
):
    return repo.listar_historial(empresa_id, granja_id)


@router.post(
    "/historial",
    response_model=HistorialProdRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar historial de productividad",
)
def crear_historial(
    payload: HistorialProdCreate,
    repo: ProductividadRepository = Depends(get_repo),
):
    return repo.crear_historial(payload)
