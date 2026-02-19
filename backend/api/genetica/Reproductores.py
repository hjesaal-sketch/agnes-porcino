# backend/api/genetica/Reproductores.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.genetica.Reproductores import (
    VerracoRepository,
    VerracoRead,
    VerracoCreate,
    VerracoUpdate,
)

router = APIRouter(
    prefix="/genetica/verracos",
    tags=["Genética - Reproductores"],
)


def get_repo(db: Session = Depends(get_db)) -> VerracoRepository:
    return VerracoRepository(db)


@router.get(
    "/",
    response_model=List[VerracoRead],
    summary="Listar verracos de la granja",
)
def listar_verracos(
    empresa_id: int,
    granja_id: int,
    repo: VerracoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=VerracoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar verraco",
)
def crear_verraco(
    payload: VerracoCreate,
    repo: VerracoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{verraco_id}",
    response_model=VerracoRead,
    summary="Actualizar verraco",
)
def actualizar_verraco(
    verraco_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: VerracoUpdate,
    repo: VerracoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(verraco_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verraco no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{verraco_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar verraco",
)
def eliminar_verraco(
    verraco_id: int,
    empresa_id: int,
    granja_id: int,
    repo: VerracoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(verraco_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verraco no encontrado",
        )
    repo.eliminar(reg)
