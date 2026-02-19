# backend/api/reportes/Genetica.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Genetica import (
    GeneticaIndicadorRepository,
    GeneticaIndicadorRead,
    GeneticaIndicadorCreate,
)

router = APIRouter(
    prefix="/reportes/genetica",
    tags=["Reportes - Genética"],
)


def get_repo(db: Session = Depends(get_db)) -> GeneticaIndicadorRepository:
    return GeneticaIndicadorRepository(db)


@router.get(
    "/",
    response_model=List[GeneticaIndicadorRead],
    summary="Listar indicadores genéticos por periodo",
)
def listar_genetica(
    empresa_id: int,
    granja_id: int,
    periodo: Optional[str] = Query(None, description="Periodo YYYY-MM"),
    repo: GeneticaIndicadorRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        periodo=periodo,
    )


@router.post(
    "/",
    response_model=GeneticaIndicadorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar indicador genético",
)
def crear_genetica(
    payload: GeneticaIndicadorCreate,
    repo: GeneticaIndicadorRepository = Depends(get_repo),
):
    return repo.crear(payload)
