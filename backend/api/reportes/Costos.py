# backend/api/reportes/Costos.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Costos import (
    CostoIndicadorRepository,
    CostoIndicadorRead,
    CostoIndicadorCreate,
)

router = APIRouter(
    prefix="/reportes/costos",
    tags=["Reportes - Costos"],
)


def get_repo(db: Session = Depends(get_db)) -> CostoIndicadorRepository:
    return CostoIndicadorRepository(db)


@router.get(
    "/",
    response_model=List[CostoIndicadorRead],
    summary="Listar indicadores de costos por periodo",
)
def listar_costos(
    empresa_id: int,
    granja_id: int,
    periodo: Optional[str] = Query(None, description="Periodo YYYY-MM"),
    repo: CostoIndicadorRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        periodo=periodo,
    )


@router.post(
    "/",
    response_model=CostoIndicadorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar indicador de costos",
)
def crear_costos(
    payload: CostoIndicadorCreate,
    repo: CostoIndicadorRepository = Depends(get_repo),
):
    return repo.crear(payload)
