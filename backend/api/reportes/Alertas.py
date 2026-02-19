# backend/api/reportes/Alertas.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.reportes.Alertas import (
    AlertaRepository,
    AlertaRead,
    AlertaCreate,
    AlertaUpdate,
)

router = APIRouter(
    prefix="/reportes/alertas",
    tags=["Reportes - Alertas"],
)


def get_repo(db: Session = Depends(get_db)) -> AlertaRepository:
    return AlertaRepository(db)


@router.get(
    "/",
    response_model=List[AlertaRead],
    summary="Listar alertas por granja",
)
def listar_alertas(
    empresa_id: int,
    granja_id: int,
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    solo_abiertas: bool = Query(False, description="Solo alertas abiertas"),
    repo: AlertaRepository = Depends(get_repo),
):
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        tipo=tipo,
        solo_abiertas=solo_abiertas,
    )


@router.get(
    "/{alerta_id}",
    response_model=AlertaRead,
    summary="Obtener alerta por ID",
)
def obtener_alerta(
    alerta_id: int,
    repo: AlertaRepository = Depends(get_repo),
):
    return repo.obtener_por_id(alerta_id)


@router.post(
    "/",
    response_model=AlertaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva alerta",
)
def crear_alerta(
    payload: AlertaCreate,
    repo: AlertaRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{alerta_id}",
    response_model=AlertaRead,
    summary="Actualizar alerta",
)
def actualizar_alerta(
    alerta_id: int,
    payload: AlertaUpdate,
    repo: AlertaRepository = Depends(get_repo),
):
    reg = repo.actualizar(alerta_id, payload)
    if not reg:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return reg
