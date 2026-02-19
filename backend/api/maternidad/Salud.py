# backend/api/maternidad/Salud.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Salud import (
    SaludRead,
    SaludCreate,
    SaludUpdate,
    SaludRepository,
)

router = APIRouter(
    prefix="/maternidad/salud", tags=["Maternidad - Salud"]
)


def get_repo(db: Session = Depends(get_db)) -> SaludRepository:
    return SaludRepository(db)


@router.get(
    "/",
    response_model=List[SaludRead],
    summary="Listar eventos de salud en maternidad por granja",
)
def listar_salud(
    empresa_id: int,
    granja_id: int,
    repo: SaludRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=SaludRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar evento de salud en maternidad",
)
def crear_salud(
    payload: SaludCreate,
    repo: SaludRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{registro_id}",
    response_model=SaludRead,
    summary="Actualizar evento de salud en maternidad",
)
def actualizar_salud(
    registro_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: SaludUpdate,
    repo: SaludRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(registro_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de salud no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{registro_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar evento de salud en maternidad",
)
def eliminar_salud(
    registro_id: int,
    empresa_id: int,
    granja_id: int,
    repo: SaludRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(registro_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de salud no encontrado",
        )
    repo.eliminar(reg)
