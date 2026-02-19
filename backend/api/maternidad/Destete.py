# backend/api/maternidad/Destete.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Destete import (
    DesteteRead,
    DesteteCreate,
    DesteteUpdate,
    DesteteRepository,
)

router = APIRouter(prefix="/maternidad/destete", tags=["Maternidad - Destete"])


def get_repo(db: Session = Depends(get_db)) -> DesteteRepository:
    return DesteteRepository(db)


@router.get(
    "/",
    response_model=List[DesteteRead],
    summary="Listar registros de destete por granja",
)
def listar_destetes(
    empresa_id: int,
    granja_id: int,
    repo: DesteteRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=DesteteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar destete",
)
def crear_destete(
    payload: DesteteCreate,
    repo: DesteteRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{destete_id}",
    response_model=DesteteRead,
    summary="Actualizar destete",
)
def actualizar_destete(
    destete_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: DesteteUpdate,
    repo: DesteteRepository = Depends(get_repo),
):
    destete = repo.obtener_por_id(destete_id, empresa_id, granja_id)
    if not destete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de destete no encontrado",
        )
    return repo.actualizar(destete, cambios)


@router.delete(
    "/{destete_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar destete",
)
def eliminar_destete(
    destete_id: int,
    empresa_id: int,
    granja_id: int,
    repo: DesteteRepository = Depends(get_repo),
):
    destete = repo.obtener_por_id(destete_id, empresa_id, granja_id)
    if not destete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de destete no encontrado",
        )
    repo.eliminar(destete)
