# backend/api/gestacion/Partos.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Partos import (
    PartoProgramado,
    PartoCreate,
    PartoRead,
    PartoUpdate,
    PartosProgramadosRepository,
)
from backend.models.gestacion.Madres import Madre
from backend.validators.gestacion_validators import GestacionValidationError

router = APIRouter(
    prefix="/gestacion/partos-programados",
    tags=["Gestación - Partos programados"],
)


def get_repo(db: Session = Depends(get_db)) -> PartosProgramadosRepository:
    return PartosProgramadosRepository(db)


def _to_parto_read(
    parto: PartoProgramado,
    db: Session,
) -> PartoRead:
    """
    Mapea el modelo de dominio PartoProgramado al esquema API PartoRead.
    Resuelve idMadre desde la tabla sows.
    """
    madre = db.query(Madre).filter(Madre.id == parto.sow_id).first()
    id_madre = madre.identificacion if madre else ""

    return PartoRead(
        id=parto.id,
        idMadre=id_madre,
        granja_id=parto.granja_id,
        fechaServicio=parto.fecha_servicio,
        fechaProbableParto=parto.fecha_probable,
        tipoServicio=parto.tipo_servicio,
        observaciones=parto.observaciones,
        realizado=parto.realizado,
        servicio_id=parto.servicio_id,
        sow_id=parto.sow_id,
        created_at=parto.created_at,
        updated_at=parto.updated_at,
    )


@router.get(
    "/",
    response_model=List[PartoRead],
    summary="Listar partos programados por granja",
)
def listar_partos(
    granja_id: int,
    repo: PartosProgramadosRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    partos = repo.listar_por_granja(granja_id)
    return [_to_parto_read(p, db) for p in partos]


@router.post(
    "/",
    response_model=PartoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear parto programado",
)
def crear_parto(
    payload: PartoCreate,
    repo: PartosProgramadosRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    try:
        parto = repo.crear(payload)
        return _to_parto_read(parto, db)
    except GestacionValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )


@router.put(
    "/{parto_id}",
    response_model=PartoRead,
    summary="Actualizar parto programado",
)
def actualizar_parto(
    parto_id: int,
    granja_id: int,
    cambios: PartoUpdate,
    repo: PartosProgramadosRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    parto = repo.obtener_por_id(parto_id, granja_id)
    if not parto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parto no encontrado",
        )

    try:
        parto = repo.actualizar(parto, cambios)
        return _to_parto_read(parto, db)
    except GestacionValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )


@router.delete(
    "/{parto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar parto programado",
)
def eliminar_parto(
    parto_id: int,
    granja_id: int,
    repo: PartosProgramadosRepository = Depends(get_repo),
):
    parto = repo.obtener_por_id(parto_id, granja_id)
    if not parto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parto no encontrado",
        )
    repo.eliminar(parto)
