# backend/api/maternidad/Lactancia.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Lactancia import (
    ControlLactanciaRead,
    ControlLactanciaCreate,
    ControlLactanciaUpdate,
    LactanciaRepository,
)

router = APIRouter(
    prefix="/maternidad/lactancia", tags=["Maternidad - Lactancia"]
)


def get_repo(db: Session = Depends(get_db)) -> LactanciaRepository:
    return LactanciaRepository(db)


@router.get(
    "/",
    response_model=List[ControlLactanciaRead],
    summary="Listar controles de lactancia por granja",
)
def listar_controles(
    empresa_id: int,
    granja_id: int,
    repo: LactanciaRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=ControlLactanciaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar control de lactancia",
)
def crear_control(
    payload: ControlLactanciaCreate,
    repo: LactanciaRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{control_id}",
    response_model=ControlLactanciaRead,
    summary="Actualizar control de lactancia",
)
def actualizar_control(
    control_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: ControlLactanciaUpdate,
    repo: LactanciaRepository = Depends(get_repo),
):
    control = repo.obtener_por_id(control_id, empresa_id, granja_id)
    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control de lactancia no encontrado",
        )
    return repo.actualizar(control, cambios)


@router.delete(
    "/{control_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar control de lactancia",
)
def eliminar_control(
    control_id: int,
    empresa_id: int,
    granja_id: int,
    repo: LactanciaRepository = Depends(get_repo),
):
    control = repo.obtener_por_id(control_id, empresa_id, granja_id)
    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control de lactancia no encontrado",
        )
    repo.eliminar(control)
