# backend/api/condicion_corporal/Backfat.py
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.condicion_corporal.Backfat import (
    BackfatRead,
    BackfatCreate,
    BackfatUpdate,
    BackfatRepository,
    BackfatValidationError,
)

router = APIRouter(
    prefix="/condicion-corporal",
    tags=["Condición corporal - I. G. Dorsal"],
)


def get_repo(db: Session = Depends(get_db)) -> BackfatRepository:
    return BackfatRepository(db)


# ---- Listar por filtros ----


@router.get(
    "/mediciones",
    response_model=List[BackfatRead],
    summary="Listar mediciones de I. G. Dorsal",
)
def listar_mediciones(
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    sow_id: Optional[int] = Query(None),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    etapa: Optional[str] = Query(None),
    repo: BackfatRepository = Depends(get_repo),
):
    """
    Lista mediciones activas de I. G. Dorsal.

    Filtros:
    - empresa_id, granja_id: obligatorios.
    - sow_id: opcional, para una cerda específica.
    - fecha_desde / fecha_hasta: rango de fechas.
    - etapa: gestacion, lactancia, reposo, reemplazo.
    """
    return repo.listar_por_periodo(
        empresa_id=empresa_id,
        granja_id=granja_id,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        etapa=etapa,
        sow_id=sow_id,
    )


@router.get(
    "/mediciones/cerda/{sow_id}",
    response_model=List[BackfatRead],
    summary="Listar mediciones de I. G. Dorsal por cerda",
)
def listar_mediciones_por_cerda(
    sow_id: int,
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    etapa: Optional[str] = Query(None),
    repo: BackfatRepository = Depends(get_repo),
):
    return repo.listar_por_cerda(
        empresa_id=empresa_id,
        granja_id=granja_id,
        sow_id=sow_id,
        etapa=etapa,
    )


# ---- Crear medición ----


@router.post(
    "/mediciones",
    response_model=BackfatRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar medición de I. G. Dorsal",
)
def crear_medicion(
    payload: BackfatCreate,
    repo: BackfatRepository = Depends(get_repo),
):
    try:
        return repo.crear(payload)
    except BackfatValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except ValueError as exc:
        # Errores de Pydantic que queramos exponer igual
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


# ---- Actualizar medición ----


@router.put(
    "/mediciones/{medicion_id}",
    response_model=BackfatRead,
    summary="Actualizar medición de I. G. Dorsal",
)
def actualizar_medicion(
    medicion_id: int,
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    cambios: BackfatUpdate = ...,
    repo: BackfatRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(medicion_id, empresa_id, granja_id)
    if not reg or not reg.activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medición de I. G. Dorsal no encontrada o inactiva.",
        )
    try:
        return repo.actualizar(reg, cambios)
    except BackfatValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


# ---- Eliminar medición (borrado lógico) ----


@router.delete(
    "/mediciones/{medicion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar medición de I. G. Dorsal (borrado lógico)",
)
def eliminar_medicion(
    medicion_id: int,
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    repo: BackfatRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(medicion_id, empresa_id, granja_id)
    if not reg or not reg.activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medición de I. G. Dorsal no encontrada o ya inactiva.",
        )
    # Política actual: siempre borrado lógico.
    repo.eliminar_logico(reg)
    return
