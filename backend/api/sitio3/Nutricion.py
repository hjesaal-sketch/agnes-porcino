# backend/api/sitio3/Nutricion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Nutricion import (
    NutricionS3Repository,
    NutricionS3Read,
    NutricionS3Create,
    NutricionS3Update,
)

router = APIRouter(
    prefix="/sitio3/nutricion",
    tags=["Sitio 3 - Nutrición"],
)


def get_repo(db: Session = Depends(get_db)) -> NutricionS3Repository:
    return NutricionS3Repository(db)


@router.get(
    "/",
    response_model=List[NutricionS3Read],
    summary="Listar registros nutricionales Sitio 3",
)
def listar_nutricion_s3(
    empresa_id: int,
    granja_id: int,
    repo: NutricionS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=NutricionS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nutrición Sitio 3",
)
def crear_nutricion_s3(
    payload: NutricionS3Create,
    repo: NutricionS3Repository = Depends(get_repo),
):
    if payload.alimento_consumido < 0 or payload.cantidad_suplemento < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alimento y suplemento no pueden ser negativos",
        )
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=NutricionS3Read,
    summary="Actualizar nutrición Sitio 3",
)
def actualizar_nutricion_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: NutricionS3Update,
    repo: NutricionS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro nutricional Sitio 3 no encontrado",
        )

    data = cambios.dict(exclude_unset=True)
    nuevo_alim = data.get("alimento_consumido", reg.alimento_consumido)
    nuevo_supl = data.get("cantidad_suplemento", reg.cantidad_suplemento)
    if nuevo_alim < 0 or nuevo_supl < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alimento y suplemento no pueden ser negativos",
        )

    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar registro nutricional Sitio 3",
)
def eliminar_nutricion_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: NutricionS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro nutricional Sitio 3 no encontrado",
        )
    repo.eliminar(reg)
