# backend/api/sitio3/Mortalidad.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Mortalidad import (
    MortalidadS3Repository,
    MortalidadS3Read,
    MortalidadS3Create,
    MortalidadS3Update,
)
from backend.validators.crecimiento_validators import (
    CrecimientoValidators,
    DatosMortalidadSitio,
    CrecimientoValidationError,
)

router = APIRouter(
    prefix="/sitio3/mortalidad",
    tags=["Sitio 3 - Mortalidad"],
)


def get_repo(db: Session = Depends(get_db)) -> MortalidadS3Repository:
    return MortalidadS3Repository(db)


@router.get(
    "/",
    response_model=List[MortalidadS3Read],
    summary="Listar mortalidad/descartes Sitio 3",
)
def listar_mortalidad_s3(
    empresa_id: int,
    granja_id: int,
    repo: MortalidadS3Repository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=MortalidadS3Read,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar baja/Descarte Sitio 3",
)
def crear_mortalidad_s3(
    payload: MortalidadS3Create,
    repo: MortalidadS3Repository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    try:
        CrecimientoValidators.validar_mortalidad(
            db=db,
            datos=DatosMortalidadSitio(
                empresa_id=payload.empresa_id,
                granja_id=payload.granja_id,
                lote=payload.lote,
                corral=payload.corral,
                cantidad=payload.cantidad,
                tipo=payload.tipo,
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
    response_model=MortalidadS3Read,
    summary="Actualizar baja/Descarte Sitio 3",
)
def actualizar_mortalidad_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MortalidadS3Update,
    repo: MortalidadS3Repository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad Sitio 3 no encontrado",
        )

    # Validar solo si se tocan datos críticos
    if any(
        getattr(cambios, campo) is not None
        for campo in ("lote", "corral", "cantidad", "tipo")
    ):
        datos = DatosMortalidadSitio(
            empresa_id=reg.empresa_id,
            granja_id=reg.granja_id,
            lote=cambios.lote or reg.lote,
            corral=cambios.corral or reg.corral,
            cantidad=(
                cambios.cantidad if cambios.cantidad is not None else reg.cantidad
            ),
            tipo=cambios.tipo or reg.tipo,
        )
        try:
            CrecimientoValidators.validar_mortalidad(db=db, datos=datos)
        except CrecimientoValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            )

    return repo.actualizar(reg, cambios)


@router.delete(
    "/{reg_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar baja/Descarte Sitio 3",
)
def eliminar_mortalidad_s3(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MortalidadS3Repository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad Sitio 3 no encontrado",
        )
    repo.eliminar(reg)
