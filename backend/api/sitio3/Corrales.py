# backend/api/sitio3/Corrales.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Corrales import (
    CorralS3Repository,
    CorralS3Read,
    CorralS3Create,
    CorralS3Update,
)

router = APIRouter(
    prefix="/sitio3/corrales",
    tags=["Sitio 3 - Corrales"],
)


def get_repo(db: Session = Depends(get_db)) -> CorralS3Repository:
    return CorralS3Repository(db)


@router.get(
    "/",
    response_model=List[CorralS3Read],
    summary="Listar corrales Sitio 3",
)
def listar_corrales_s3(
    empresa_id: int,
    granja_id: int,
    repo: CorralS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=CorralS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar corral Sitio 3",
)
def crear_corral_s3(
    payload: CorralS3Create,
    repo: CorralS3Repository = Depends(get_repo),
):
    # validación de ocupación vs capacidad
    if payload.ocupacion_actual > payload.capacidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La ocupación no puede superar la capacidad",
        )
    return repo.crear(payload)


@router.put(
    "/{corral_id}",
    response_model=CorralS3Read,
    summary="Actualizar corral Sitio 3",
)
def actualizar_corral_s3(
    corral_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: CorralS3Update,
    repo: CorralS3Repository = Depends(get_repo),
):
    corral = repo.obtener_por_id(corral_id, empresa_id, granja_id)
    if not corral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corral Sitio 3 no encontrado",
        )

    # si vienen capacidad/ocupación nuevas, se valida
    data = cambios.dict(exclude_unset=True)
    nueva_cap = data.get("capacidad", corral.capacidad)
    nueva_ocu = data.get("ocupacion_actual", corral.ocupacion_actual)
    if nueva_ocu > nueva_cap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La ocupación no puede superar la capacidad",
        )

    return repo.actualizar(corral, cambios)


@router.delete(
    "/{corral_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar corral Sitio 3",
)
def eliminar_corral_s3(
    corral_id: int,
    empresa_id: int,
    granja_id: int,
    repo: CorralS3Repository = Depends(get_repo),
):
    corral = repo.obtener_por_id(corral_id, empresa_id, granja_id)
    if not corral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corral Sitio 3 no encontrado",
        )
    repo.eliminar(corral)
