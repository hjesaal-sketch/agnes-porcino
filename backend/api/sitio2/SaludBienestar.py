# backend/api/sitio2/SaludBienestar.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.SaludBienestar import (
    SaludBienestarRepository,
    SaludBienestarRead,
    SaludBienestarCreate,
    SaludBienestarUpdate,
)

router = APIRouter(
    prefix="/sitio2/salud-bienestar",
    tags=["Sitio 2 - Salud y Bienestar"],
)


def get_repo(db: Session = Depends(get_db)) -> SaludBienestarRepository:
    return SaludBienestarRepository(db)


@router.get(
    "/",
    response_model=List[SaludBienestarRead],
    summary="Listar eventos de salud/bienestar",
)
def listar_salud_bienestar(
    empresa_id: int,
    granja_id: int,
    repo: SaludBienestarRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=SaludBienestarRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de salud/bienestar",
)
def crear_salud_bienestar(
    payload: SaludBienestarCreate,
    repo: SaludBienestarRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=SaludBienestarRead,
    summary="Actualizar evento de salud/bienestar",
)
def actualizar_salud_bienestar(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: SaludBienestarUpdate,
    repo: SaludBienestarRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de salud/bienestar no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de salud/bienestar",
)
def eliminar_salud_bienestar(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: SaludBienestarRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento de salud/bienestar no encontrado",
        )
    repo.eliminar(reg)
