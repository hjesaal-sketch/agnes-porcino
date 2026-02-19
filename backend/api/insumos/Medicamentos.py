# backend/api/insumos/Medicamentos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Medicamentos import (
    MedicamentoRead,
    MedicamentoCreate,
    MedicamentoUpdate,
    MedicamentoRepository,
)
from backend.validators.insumos_medicamentos_validators import MedicamentoValidationError

router = APIRouter(
    prefix="/insumos/medicamentos", tags=["Insumos - Medicamentos"]
)


def get_repo(db: Session = Depends(get_db)) -> MedicamentoRepository:
    return MedicamentoRepository(db)


@router.get(
    "/",
    response_model=List[MedicamentoRead],
    summary="Listar medicamentos por granja",
)
def listar_medicamentos(
    empresa_id: int,
    granja_id: int,
    repo: MedicamentoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=MedicamentoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar medicamento",
)
def crear_medicamento(
    payload: MedicamentoCreate,
    repo: MedicamentoRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except MedicamentoValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.put(
    "/{med_id}",
    response_model=MedicamentoRead,
    summary="Actualizar medicamento",
)
def actualizar_medicamento(
    med_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MedicamentoUpdate,
    repo: MedicamentoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(med_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento no encontrado",
        )

    try:
        return repo.actualizar(reg, cambios)
    except MedicamentoValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.delete(
    "/{med_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar medicamento",
)
def eliminar_medicamento(
    med_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MedicamentoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(med_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento no encontrado",
        )
    repo.eliminar(reg)
