# backend/api/sitio2/Nutricion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Nutricion import (
    NutricionRepository,
    NutricionRead,
    NutricionCreate,
    NutricionUpdate,
)

router = APIRouter(
    prefix="/sitio2/nutricion",
    tags=["Sitio 2 - Nutrición"],
)


def get_repo(db: Session = Depends(get_db)) -> NutricionRepository:
    return NutricionRepository(db)


@router.get(
    "/",
    response_model=List[NutricionRead],
    summary="Listar registros nutricionales",
)
def listar_nutricion(
    empresa_id: int,
    granja_id: int,
    repo: NutricionRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=NutricionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar consumo nutricional",
)
def crear_nutricion(
    payload: NutricionCreate,
    repo: NutricionRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=NutricionRead,
    summary="Actualizar registro nutricional",
)
def actualizar_nutricion(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: NutricionUpdate,
    repo: NutricionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro nutricional no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar registro nutricional",
)
def eliminar_nutricion(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: NutricionRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro nutricional no encontrado",
        )
    repo.eliminar(reg)
