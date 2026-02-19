# backend/api/sitio3/SaludBienestar.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.SaludBienestar import (
    SaludS3Repository,
    SaludS3Read,
    SaludS3Create,
    SaludS3Update,
)

router = APIRouter(
    prefix="/sitio3/salud",
    tags=["Sitio 3 - Salud y Bienestar"],
)


def get_repo(db: Session = Depends(get_db)) -> SaludS3Repository:
    return SaludS3Repository(db)


@router.get(
    "/",
    response_model=List[SaludS3Read],
    summary="Listar eventos de salud/bienestar Sitio 3",
)
def listar_salud_s3(
    empresa_id: int,
    granja_id: int,
    repo: SaludS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=SaludS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de salud/bienestar Sitio 3",
)
def crear_salud_s3(
    payload: SaludS3Create,
    repo: SaludS3Repository = Depends(get_repo),
):
    if not payload.evento or not payload.tratamiento:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evento y tratamiento son obligatorios",
        )
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=SaludS3Read,
    summary="Actualizar evento de salud/bienestar Sitio 3",
)
def actualizar_salud_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: SaludS3Update,
    repo: SaludS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de salud Sitio 3 no encontrado",
        )

    data = cambios.dict(exclude_unset=True)
    nuevo_evento = data.get("evento", reg.evento)
    nuevo_trat = data.get("tratamiento", reg.tratamiento)
    if not nuevo_evento or not nuevo_trat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evento y tratamiento son obligatorios",
        )

    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de salud/bienestar Sitio 3",
)
def eliminar_salud_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: SaludS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de salud Sitio 3 no encontrado",
        )
    repo.eliminar(reg)
