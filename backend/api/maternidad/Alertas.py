# backend/api/maternidad/Alertas.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Alertas import (
    MaternidadAlertaRead,
    MaternidadAlertaCreate,
    MaternidadAlertaUpdate,
    MaternidadAlertasRepository,
)

router = APIRouter(prefix="/maternidad/alertas", tags=["Maternidad - Alertas"])


def get_repo(db: Session = Depends(get_db)) -> MaternidadAlertasRepository:
    return MaternidadAlertasRepository(db)


@router.get(
    "/",
    response_model=List[MaternidadAlertaRead],
    summary="Listar alertas de maternidad por granja",
)
def listar_alertas(
    empresa_id: int,
    granja_id: int,
    solo_pendientes: bool = False,
    repo: MaternidadAlertasRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id, solo_pendientes)


@router.post(
    "/",
    response_model=MaternidadAlertaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear alerta de maternidad",
)
def crear_alerta(
    payload: MaternidadAlertaCreate,
    repo: MaternidadAlertasRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{alerta_id}",
    response_model=MaternidadAlertaRead,
    summary="Actualizar alerta de maternidad",
)
def actualizar_alerta(
    alerta_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MaternidadAlertaUpdate,
    repo: MaternidadAlertasRepository = Depends(get_repo),
):
    alerta = repo.obtener_por_id(alerta_id, empresa_id, granja_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    return repo.actualizar(alerta, cambios)


@router.post(
    "/{alerta_id}/leer",
    response_model=MaternidadAlertaRead,
    summary="Marcar alerta de maternidad como leída/no leída",
)
def marcar_alerta_leida(
    alerta_id: int,
    empresa_id: int,
    granja_id: int,
    leida: bool = True,
    repo: MaternidadAlertasRepository = Depends(get_repo),
):
    alerta = repo.obtener_por_id(alerta_id, empresa_id, granja_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    return repo.marcar_leida(alerta, leida)


@router.delete(
    "/{alerta_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar alerta de maternidad",
)
def eliminar_alerta(
    alerta_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MaternidadAlertasRepository = Depends(get_repo),
):
    alerta = repo.obtener_por_id(alerta_id, empresa_id, granja_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    repo.eliminar(alerta)
