# backend/api/reportes/Nutricion.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Nutricion import (
    NutricionIndicadorRepository,
    NutricionIndicadorRead,
    NutricionIndicadorCreate,
)

router = APIRouter(
    prefix="/reportes/nutricion",
    tags=["Reportes - Nutrición"],
)


def get_repo(db: Session = Depends(get_db)) -> NutricionIndicadorRepository:
    return NutricionIndicadorRepository(db)


@router.get(
    "/",
    response_model=List[NutricionIndicadorRead],
    summary="Listar indicadores nutricionales por periodo",
)
def listar_nutricion(
    empresa_id: int,
    granja_id: int,
    periodo: Optional[str] = Query(None, description="Periodo YYYY-MM"),
    repo: NutricionIndicadorRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        periodo=periodo,
    )


@router.post(
    "/",
    response_model=NutricionIndicadorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar indicador nutricional",
)
def crear_nutricion(
    payload: NutricionIndicadorCreate,
    repo: NutricionIndicadorRepository = Depends(get_repo),
):
    return repo.crear(payload)
