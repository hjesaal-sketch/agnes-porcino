# backend/api/granja/Instalaciones.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Instalaciones import (
  InstalacionRepository,
  InstalacionGranjaRead,
  InstalacionGranjaCreate,
  InstalacionGranjaUpdate,
)

router = APIRouter(
  prefix="/granja/instalaciones",
  tags=["Granja - Instalaciones"],
)


def get_repo(db: Session = Depends(get_db)) -> InstalacionRepository:
  return InstalacionRepository(db)


@router.get(
  "/",
  response_model=List[InstalacionGranjaRead],
  summary="Listar instalaciones de la granja",
)
def listar_instalaciones(
    empresa_id: int,
    granja_id: int,
    repo: InstalacionRepository = Depends(get_repo),
):
  return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
  "/",
  response_model=InstalacionGranjaRead,
  status_code=status.HTTP_201_CREATED,
  summary="Registrar instalación",
)
def crear_instalacion(
    payload: InstalacionGranjaCreate,
    repo: InstalacionRepository = Depends(get_repo),
):
  return repo.crear(payload)


@router.put(
  "/{inst_id}",
  response_model=InstalacionGranjaRead,
  summary="Actualizar instalación",
)
def actualizar_instalacion(
    inst_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: InstalacionGranjaUpdate,
    repo: InstalacionRepository = Depends(get_repo),
):
  reg = repo.obtener_por_id(inst_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Instalación no encontrada",
    )
  return repo.actualizar(reg, cambios)


@router.delete(
  "/{inst_id}",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="Eliminar instalación",
)
def eliminar_instalacion(
    inst_id: int,
    empresa_id: int,
    granja_id: int,
    repo: InstalacionRepository = Depends(get_repo),
):
  reg = repo.obtener_por_id(inst_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Instalación no encontrada",
    )
  repo.eliminar(reg)
