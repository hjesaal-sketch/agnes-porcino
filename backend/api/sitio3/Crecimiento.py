# backend/api/sitio3/Crecimiento.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Crecimiento import (
  CrecimientoS3Repository,
  CrecimientoS3Read,
  CrecimientoS3Create,
  CrecimientoS3Update,
)

router = APIRouter(
  prefix="/sitio3/crecimiento",
  tags=["Sitio 3 - Crecimiento"],
)


def get_repo(db: Session = Depends(get_db)) -> CrecimientoS3Repository:
  return CrecimientoS3Repository(db)


@router.get(
  "/",
  response_model=List[CrecimientoS3Read],
  summary="Listar pesajes Sitio 3",
)
def listar_crecimiento_s3(
  empresa_id: int,
  granja_id: int,
  repo: CrecimientoS3Repository = Depends(get_repo),
):
  return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
  "/",
  response_model=CrecimientoS3Read,
  status_code=status.HTTP_201_CREATED,
  summary="Registrar pesaje Sitio 3",
)
def crear_crecimiento_s3(
  payload: CrecimientoS3Create,
  repo: CrecimientoS3Repository = Depends(get_repo),
):
  if payload.cantidad_pesada <= 0 or payload.peso_promedio <= 0:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Cantidad y peso promedio deben ser > 0",
    )
  return repo.crear(payload)


@router.put(
  "/{reg_id}",
  response_model=CrecimientoS3Read,
  summary="Actualizar pesaje Sitio 3",
)
def actualizar_crecimiento_s3(
  reg_id: int,
  empresa_id: int,
  granja_id: int,
  cambios: CrecimientoS3Update,
  repo: CrecimientoS3Repository = Depends(get_repo),
):
  reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Registro de crecimiento Sitio 3 no encontrado",
    )

  data = cambios.dict(exclude_unset=True)
  nueva_cant = data.get("cantidad_pesada", reg.cantidad_pesada)
  nuevo_peso = data.get("peso_promedio", reg.peso_promedio)
  if nueva_cant <= 0 or nuevo_peso <= 0:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Cantidad y peso promedio deben ser > 0",
    )

  return repo.actualizar(reg, cambios)


@router.delete(
  "/{reg_id}",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="Eliminar pesaje Sitio 3",
)
def eliminar_crecimiento_s3(
  reg_id: int,
  empresa_id: int,
  granja_id: int,
  repo: CrecimientoS3Repository = Depends(get_repo),
):
  reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Registro de crecimiento Sitio 3 no encontrado",
    )
  repo.eliminar(reg)
