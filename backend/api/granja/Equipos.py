# backend/api/granja/Equipos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Equipos import (
    EquipoGranjaRepository,
    EquipoGranjaRead,
    EquipoGranjaCreate,
    EquipoGranjaUpdate,
)

router = APIRouter(
    prefix="/granja/equipos",
    tags=["Granja - Equipos"],
)


def get_repo(db: Session = Depends(get_db)) -> EquipoGranjaRepository:
    return EquipoGranjaRepository(db)


@router.get(
    "/",
    response_model=List[EquipoGranjaRead],
    summary="Listar equipos y activos de la granja",
)
def listar_equipos(
    empresa_id: int,
    granja_id: int,
    repo: EquipoGranjaRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=EquipoGranjaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar equipo/activo",
)
def crear_equipo(
    payload: EquipoGranjaCreate,
    repo: EquipoGranjaRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{equipo_id}",
    response_model=EquipoGranjaRead,
    summary="Actualizar equipo/activo",
)
def actualizar_equipo(
    equipo_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: EquipoGranjaUpdate,
    repo: EquipoGranjaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(equipo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{equipo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar equipo/activo",
)
def eliminar_equipo(
    equipo_id: int,
    empresa_id: int,
    granja_id: int,
    repo: EquipoGranjaRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(equipo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    repo.eliminar(reg)
