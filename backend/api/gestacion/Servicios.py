# backend/api/gestacion/Servicios.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.gestacion.Servicios import (
    ServicioGestacion,
    ServicioCreate,
    ServicioRead,
    ServicioUpdate,
    ServiciosGestacionRepository,
)
from backend.models.gestacion.Madres import Madre
from backend.models.core.granjas import Granja
from backend.validators.gestacion_validators import (
    GestacionValidators,
    DatosServicioGestacion,
    GestacionValidationError,
)
from enum import Enum


router = APIRouter(prefix="/gestacion/servicios", tags=["Gestación - Servicios"])


class OrderDirection(str, Enum):
  asc = "asc"
  desc = "desc"


def get_repo(db: Session = Depends(get_db)) -> ServiciosGestacionRepository:
    return ServiciosGestacionRepository(db)


def _to_servicio_read(
    servicio: ServicioGestacion,
    db: Session,
) -> ServicioRead:
    """
    Mapea el modelo de dominio ServicioGestacion al esquema API ServicioRead.
    Resuelve identificacionMadre desde la tabla sows.
    """
    madre = db.query(Madre).filter(Madre.id == servicio.sow_id).first()
    identificacion = madre.identificacion if madre else ""

    return ServicioRead(
        id=servicio.id,
        fecha=servicio.fecha,
        identificacionMadre=identificacion,
        empresa_id=servicio.empresa_id,
        granja_id=servicio.granja_id,
        tipoServicio=servicio.tipo_servicio,
        verracoId=servicio.verraco_id,
        resultado=servicio.resultado,
        observaciones=servicio.observaciones,
        subServicios=[
            {
                "id": ss.id,
                "numero": ss.numero,
                "fecha": ss.fecha,
                "verracoId": ss.verraco_id,
                "inseminador": ss.inseminador,
            }
            for ss in servicio.subservicios
        ],
        sow_id=servicio.sow_id,
        created_at=servicio.created_at,
        updated_at=servicio.updated_at,
    )


@router.get(
    "/",
    response_model=List[ServicioRead],
    summary="Listar servicios de gestación por granja",
)
def listar_servicios(
    granja_id: int,
    direction: OrderDirection = Query(OrderDirection.desc),
    repo: ServiciosGestacionRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    """
    direction:
      - desc (por defecto): más nuevos primero
      - asc: más antiguos primero
    """
    servicios = repo.listar_por_granja(granja_id=granja_id, direction=direction.value)
    return [_to_servicio_read(s, db) for s in servicios]


@router.post(
    "/",
    response_model=ServicioRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear servicio de gestación",
)
def crear_servicio(
    granja_id: int,
    payload: ServicioCreate,
    repo: ServiciosGestacionRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    granja = db.query(Granja).filter(Granja.id == granja_id).first()
    if granja is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Granja no encontrada",
        )

    try:
        GestacionValidators.validar_servicio_gestacion(
            db=db,
            datos=DatosServicioGestacion(
                empresa_id=granja.empresa_id,
                granja_id=granja_id,
                verraco_id=payload.verracoId,
                identificacion_madre=payload.identificacionMadre,
                fecha_servicio=payload.fecha,
            ),
        )
    except GestacionValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    servicio = repo.crear(payload, granja_id=granja_id)
    return _to_servicio_read(servicio, db)


@router.put(
    "/{servicio_id}",
    response_model=ServicioRead,
    summary="Actualizar servicio de gestación",
)
def actualizar_servicio(
    servicio_id: int,
    granja_id: int,
    cambios: ServicioUpdate,
    repo: ServiciosGestacionRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    servicio = repo.obtener_por_id(servicio_id, granja_id)
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )

    # Validar solo si realmente se cambia el verraco
    if cambios.verracoId is not None and cambios.verracoId != servicio.verraco_id:
        try:
            GestacionValidators.validar_servicio_gestacion(
                db=db,
                datos=DatosServicioGestacion(
                    empresa_id=servicio.empresa_id,
                    granja_id=servicio.granja_id,
                    verraco_id=cambios.verracoId,
                    sow_id=servicio.sow_id,
                    tipo_servicio=servicio.tipo_servicio,
                    resultado=servicio.resultado,
                    identificacion_madre=(
                        db.query(Madre)
                        .filter(Madre.id == servicio.sow_id)
                        .first()
                    ).identificacion
                    if servicio.sow_id
                    else None,
                ),
            )
        except GestacionValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )

    # Validar fecha del servicio si se modifica
    if cambios.fecha is not None:
        try:
            GestacionValidators.validar_servicio_gestacion(
                db=db,
                datos=DatosServicioGestacion(
                    empresa_id=servicio.empresa_id,
                    granja_id=servicio.granja_id,
                    verraco_id=servicio.verraco_id,
                    sow_id=servicio.sow_id,
                    identificacion_madre=(
                        db.query(Madre)
                        .filter(Madre.id == servicio.sow_id)
                        .first()
                    ).identificacion
                    if servicio.sow_id
                    else None,
                    fecha_servicio=cambios.fecha,
                ),
            )
        except GestacionValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )

    servicio = repo.actualizar(servicio, cambios)
    return _to_servicio_read(servicio, db)


@router.delete(
    "/{servicio_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar servicio de gestación",
)
def eliminar_servicio(
    servicio_id: int,
    granja_id: int,
    repo: ServiciosGestacionRepository = Depends(get_repo),
):
    servicio = repo.obtener_por_id(servicio_id, granja_id)
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    repo.eliminar(servicio)
