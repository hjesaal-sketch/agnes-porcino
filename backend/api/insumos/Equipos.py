# backend/api/insumos/Equipos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Equipos import (
    EquipoRead,
    EquipoCreate,
    EquipoUpdate,
    EquipoRepository,
)

router = APIRouter(prefix="/insumos/equipos", tags=["Insumos - Equipos"])


def get_repo(db: Session = Depends(get_db)) -> EquipoRepository:
    return EquipoRepository(db)


@router.get(
    "/",
    response_model=List[EquipoRead],
    summary="Listar equipos por granja",
)
def listar_equipos(
    empresa_id: int,
    granja_id: int,
    repo: EquipoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=EquipoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar equipo / herramienta",
)
def crear_equipo(
    payload: EquipoCreate,
    repo: EquipoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{equipo_id}",
    response_model=EquipoRead,
    summary="Actualizar equipo / herramienta",
)
def actualizar_equipo(
    equipo_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: EquipoUpdate,
    repo: EquipoRepository = Depends(get_repo),
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
    summary="Eliminar equipo / herramienta",
)
def eliminar_equipo(
    equipo_id: int,
    empresa_id: int,
    granja_id: int,
    repo: EquipoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(equipo_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    repo.eliminar(reg)
