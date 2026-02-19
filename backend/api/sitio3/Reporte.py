# backend/api/sitio3/Reporte.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Reporte import (
    ReporteS3Repository,
    ReporteS3Read,
    ReporteS3Create,
    ReporteS3Update,
)

router = APIRouter(
    prefix="/sitio3/reportes",
    tags=["Sitio 3 - Reportes Mensuales"],
)


def get_repo(db: Session = Depends(get_db)) -> ReporteS3Repository:
    return ReporteS3Repository(db)


@router.get(
    "/",
    response_model=List[ReporteS3Read],
    summary="Listar reportes mensuales Sitio 3",
)
def listar_reportes_s3(
    empresa_id: int,
    granja_id: int,
    repo: ReporteS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ReporteS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Crear reporte mensual Sitio 3",
)
def crear_reporte_s3(
    payload: ReporteS3Create,
    repo: ReporteS3Repository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{rep_id}",
    response_model=ReporteS3Read,
    summary="Actualizar reporte mensual Sitio 3",
)
def actualizar_reporte_s3(
    rep_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ReporteS3Update,
    repo: ReporteS3Repository = Depends(get_repo),
):
    rep = repo.obtener_por_id(rep_id, empresa_id, granja_id)
    if not rep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte Sitio 3 no encontrado",
        )
    return repo.actualizar(rep, cambios)


@router.delete(
    "/{rep_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar reporte mensual Sitio 3",
)
def eliminar_reporte_s3(
    rep_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ReporteS3Repository = Depends(get_repo),
):
    rep = repo.obtener_por_id(rep_id, empresa_id, granja_id)
    if not rep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte Sitio 3 no encontrado",
        )
    repo.eliminar(rep)
