# backend/api/gestacion/Alertas.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Alertas import (
    GestacionAlertaCreate,
    GestacionAlertaRead,
    GestacionAlertaUpdate,
    GestacionAlertasRepository,
)

router = APIRouter(
    prefix="/gestacion/alertas",
    tags=["Gestación - Alertas"],
)


def get_repo(db: Session = Depends(get_db)) -> GestacionAlertasRepository:
    return GestacionAlertasRepository(db)


@router.get(
    "/",
    response_model=List[GestacionAlertaRead],
    summary="Listar alertas de gestación por empresa y granja",
)
def listar_alertas(
    empresa_id: int = Query(..., description="ID de la empresa"),
    granja_id: int = Query(..., description="ID de la granja"),
    solo_pendientes: bool = Query(
        False,
        description="Si es true, solo devuelve alertas no leídas",
    ),
    repo: GestacionAlertasRepository = Depends(get_repo),
):
    """
    Devuelve las alertas de gestación registradas para una empresa y granja.

    Puedes filtrar solo las alertas pendientes (no leídas) con `solo_pendientes=true`.
    """
    return repo.listar_por_granja(
        empresa_id=empresa_id,
        granja_id=granja_id,
        solo_pendientes=solo_pendientes,
    )


@router.post(
    "/",
    response_model=GestacionAlertaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una alerta de gestación",
)
def crear_alerta(
    payload: GestacionAlertaCreate,
    repo: GestacionAlertasRepository = Depends(get_repo),
):
    """
    Crea una nueva alerta de gestación de forma manual
    (las generadas automáticamente también deberían pasar por este repositorio).
    """
    return repo.crear(payload)


@router.patch(
    "/{alerta_id}",
    response_model=GestacionAlertaRead,
    summary="Actualizar parcialmente una alerta de gestación",
)
def actualizar_alerta(
    alerta_id: int,
    cambios: GestacionAlertaUpdate,
    empresa_id: int = Query(..., description="ID de la empresa"),
    granja_id: int = Query(..., description="ID de la granja"),
    repo: GestacionAlertasRepository = Depends(get_repo),
):
    """
    Actualiza campos específicos de una alerta existente
    (tipo, mensaje, fecha objetivo, estado de lectura).
    """
    alerta = repo.obtener_por_id(alerta_id, empresa_id, granja_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    return repo.actualizar(alerta, cambios)


@router.post(
    "/{alerta_id}/leer",
    response_model=GestacionAlertaRead,
    summary="Marcar alerta como leída/no leída",
)
def marcar_leida(
    alerta_id: int,
    empresa_id: int = Query(..., description="ID de la empresa"),
    granja_id: int = Query(..., description="ID de la granja"),
    leida: bool = Query(True, description="True para marcar como leída, False para no leída"),
    repo: GestacionAlertasRepository = Depends(get_repo),
):
    """
    Marca una alerta como leída o no leída según el valor del parámetro `leida`.
    """
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
    summary="Eliminar una alerta de gestación",
)
def eliminar_alerta(
    alerta_id: int,
    empresa_id: int = Query(..., description="ID de la empresa"),
    granja_id: int = Query(..., description="ID de la granja"),
    repo: GestacionAlertasRepository = Depends(get_repo),
):
    """
    Elimina una alerta de gestación de forma definitiva.
    """
    alerta = repo.obtener_por_id(alerta_id, empresa_id, granja_id)
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    repo.eliminar(alerta)
    return
