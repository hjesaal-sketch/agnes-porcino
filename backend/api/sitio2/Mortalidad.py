# backend/api/sitio2/Mortalidad.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Mortalidad import (
    MortalidadRepository,
    MortalidadRead,
    MortalidadCreate,
    MortalidadUpdate,
)
from backend.validators.crecimiento_validators import (
    CrecimientoValidators,
    DatosMortalidadSitio,
    CrecimientoValidationError,
)

router = APIRouter(
    prefix="/sitio2/mortalidad",
    tags=["Sitio 2 - Mortalidad y Descartes"],
)


def get_repo(db: Session = Depends(get_db)) -> MortalidadRepository:
    return MortalidadRepository(db)


@router.get(
    "/",
    response_model=List[MortalidadRead],
    summary="Listar mortalidad y descartes",
)
def listar_mortalidad(
    empresa_id: int,
    granja_id: int,
    repo: MortalidadRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
    "/",
    response_model=MortalidadRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar baja/descarte",
)
def crear_mortalidad(
    payload: MortalidadCreate,
    repo: MortalidadRepository = Depends(get_repo),
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
    response_model=MortalidadRead,
    summary="Actualizar baja/descarte",
)
def actualizar_mortalidad(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: MortalidadUpdate,
    repo: MortalidadRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad/descarte no encontrado",
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
    summary="Eliminar baja/descarte",
)
def eliminar_mortalidad(
    reg_id: int,
    empresa_id: int,
    granja_id: int,
    repo: MortalidadRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(reg_id, empresa_id, granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de mortalidad/descarte no encontrado",
        )
    repo.eliminar(reg)
