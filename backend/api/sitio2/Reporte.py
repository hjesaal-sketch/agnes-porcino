# backend/api/sitio2/Reporte.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Reporte import (
  ReporteS2Repository,
  ReporteS2Read,
  ReporteS2Create,
  ReporteS2Update,
)

router = APIRouter(
  prefix="/sitio2/reportes",
  tags=["Sitio 2 - Reportes Mensuales"],
)


def get_repo(db: Session = Depends(get_db)) -> ReporteS2Repository:
  return ReporteS2Repository(db)


@router.get(
  "/",
  response_model=List[ReporteS2Read],
  summary="Listar reportes mensuales Sitio 2",
)
def listar_reportes_s2(
    empresa_id: int,
    granja_id: int,
    repo: ReporteS2Repository = Depends(get_repo),
):
  return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
  "/",
  response_model=ReporteS2Read,
  status_code=status.HTTP_201_CREATED,
  summary="Crear reporte mensual Sitio 2",
)
def crear_reporte_s2(
    payload: ReporteS2Create,
    repo: ReporteS2Repository = Depends(get_repo),
):
  return repo.crear(payload)


@router.put(
  "/{rep_id}",
  response_model=ReporteS2Read,
  summary="Actualizar reporte mensual Sitio 2",
)
def actualizar_reporte_s2(
    rep_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ReporteS2Update,
    repo: ReporteS2Repository = Depends(get_repo),
):
  rep = repo.obtener_por_id(rep_id, empresa_id, granja_id)
  if not rep:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Reporte Sitio 2 no encontrado",
    )
  return repo.actualizar(rep, cambios)


@router.delete(
  "/{rep_id}",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="Eliminar reporte mensual Sitio 2",
)
def eliminar_reporte_s2(
    rep_id: int,
    empresa_id: int,
    granja_id: int,
    repo: ReporteS2Repository = Depends(get_repo),
):
  rep = repo.obtener_por_id(rep_id, empresa_id, granja_id)
  if not rep:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Reporte Sitio 2 no encontrado",
    )
  repo.eliminar(rep)
