# backend/api/reportes/Productividad.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Productividad import (
    ProdIndicadorRepository,
    ProdIndicadorRead,
    ProdIndicadorCreate,
)

router = APIRouter(
    prefix="/reportes/productividad",
    tags=["Reportes - Productividad"],
)


def get_repo(db: Session = Depends(get_db)) -> ProdIndicadorRepository:
    return ProdIndicadorRepository(db)


@router.get(
    "/",
    response_model=List[ProdIndicadorRead],
    summary="Listar indicadores de productividad por periodo",
)
def listar_productividad(
    empresa_id: int,
    granja_id: int,
    periodo: Optional[str] = Query(None, description="Periodo YYYY-MM"),
    repo: ProdIndicadorRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        periodo=periodo,
    )


@router.post(
    "/",
    response_model=ProdIndicadorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar indicador de productividad",
)
def crear_productividad(
    payload: ProdIndicadorCreate,
    repo: ProdIndicadorRepository = Depends(get_repo),
):
    return repo.crear(payload)
