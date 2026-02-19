# backend/api/sitio3/Ingreso.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Ingreso import (
    IngresoS3Repository,
    IngresoS3Read,
    IngresoS3Create,
    IngresoS3Update,
)
from backend.validators.crecimiento_validators import (
    CrecimientoValidators,
    DatosIngresoSitio,
    CrecimientoValidationError,
)

router = APIRouter(
    prefix="/sitio3/ingresos",
    tags=["Sitio 3 - Ingresos"],
)


def get_repo(db: Session = Depends(get_db)) -> IngresoS3Repository:
    return IngresoS3Repository(db)


@router.get(
    "/",
    response_model=List[IngresoS3Read],
    summary="Listar ingresos Sitio 3",
)
def listar_ingresos_s3(
    empresa_id: int,
    granja_id: int,
    repo: IngresoS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=IngresoS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar ingreso Sitio 3",
)
def crear_ingreso_s3(
    payload: IngresoS3Create,
    repo: IngresoS3Repository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    try:
        CrecimientoValidators.validar_ingreso(
            db=db,
            datos=DatosIngresoSitio(
                empresa_id=payload.empresa_id,
                granja_id=payload.granja_id,
                lote=payload.lote,
                corral_destino=payload.corral_destino,
                cantidad=payload.cantidad,
                peso_promedio=payload.peso_promedio,
            ),
        )
    except CrecimientoValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return repo.crear(payload)


@router.put(
    "/{reg_id}",
    response_model=IngresoS3Read,
    summary="Actualizar ingreso Sitio 3",
)
def actualizar_ingreso_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: IngresoS3Update,
    repo: IngresoS3Repository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso Sitio 3 no encontrado",
        )

    # Validar solo si se tocan datos críticos
    if any(
        getattr(cambios, campo) is not None
        for campo in ("lote", "corral_destino", "cantidad", "peso_promedio")
    ):
        datos = DatosIngresoSitio(
            empresa_id=reg.empresa_id,
            granja_id=reg.granja_id,
            lote=cambios.lote or reg.lote,
            corral_destino=cambios.corral_destino or reg.corral_destino,
            cantidad=(
                cambios.cantidad if cambios.cantidad is not None else reg.cantidad
            ),
            peso_promedio=(
                cambios.peso_promedio
                if cambios.peso_promedio is not None
                else reg.peso_promedio
            ),
        )
        try:
            CrecimientoValidators.validar_ingreso(db=db, datos=datos)
        except CrecimientoValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            )

    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar ingreso Sitio 3",
)
def eliminar_ingreso_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: IngresoS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingreso Sitio 3 no encontrado",
        )
    repo.eliminar(reg)
