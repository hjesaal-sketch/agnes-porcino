# backend/api/reportes/Sanidad.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Sanidad import (
    SanidadIndicadorRepository,
    SanidadIndicadorRead,
    SanidadIndicadorCreate,
)

router = APIRouter(
    prefix="/reportes/sanidad",
    tags=["Reportes - Sanidad"],
)


def get_repo(db: Session = Depends(get_db)) -> SanidadIndicadorRepository:
    return SanidadIndicadorRepository(db)


@router.get(
    "/",
    response_model=List[SanidadIndicadorRead],
    summary="Listar indicadores sanitarios por periodo",
)
def listar_sanidad(
    empresa_id: int,
    granja_id: int,
    periodo: Optional[str] = Query(None, description="Periodo YYYY-MM"),
    repo: SanidadIndicadorRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        periodo=periodo,
    )


@router.post(
    "/",
    response_model=SanidadIndicadorRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar indicador sanitario",
)
def crear_sanidad(
    payload: SanidadIndicadorCreate,
    repo: SanidadIndicadorRepository = Depends(get_repo),
):
    return repo.crear(payload)
