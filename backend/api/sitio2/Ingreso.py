# backend/api/sitio2/Ingreso.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Ingreso import (
  IngresoRepository,
  IngresoRead,
  IngresoCreate,
  IngresoUpdate,
)
from backend.validators.crecimiento_validators import (
  CrecimientoValidators,
  DatosIngresoSitio,
  CrecimientoValidationError,
)

router = APIRouter(
  prefix="/sitio2/ingresos",
  tags=["Sitio 2 - Ingresos Engorde"],
)


def get_repo(db: Session = Depends(get_db)) -> IngresoRepository:
  return IngresoRepository(db)


@router.get(
  "/",
  response_model=List[IngresoRead],
  summary="Listar ingresos a engorde",
)
def listar_ingresos(
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
  return repo.listar_por_granja(empresa_id, granja_id)


@router.post(
  "/",
  response_model=IngresoRead,
  status_code=status.HTTP_201_CREATED,
  summary="Registrar ingreso a engorde",
)
def crear_ingreso(
    payload: IngresoCreate,
    repo: IngresoRepository = Depends(get_repo),
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
  "/{ingreso_id}",
  response_model=IngresoRead,
  summary="Actualizar ingreso a engorde",
)
def actualizar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: IngresoUpdate,
    repo: IngresoRepository = Depends(get_repo),
    db: Session = Depends(get_db),
):
  reg = repo.obtener_por_id(ingreso_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Ingreso no encontrado",
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
      cantidad=cambios.cantidad if cambios.cantidad is not None else reg.cantidad,
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
  "/{ingreso_id}",
  status_code=status.HTTP_204_NO_CONTENT,
  summary="Eliminar ingreso a engorde",
)
def eliminar_ingreso(
    ingreso_id: int,
    empresa_id: int,
    granja_id: int,
    repo: IngresoRepository = Depends(get_repo),
):
  reg = repo.obtener_por_id(ingreso_id, empresa_id, granja_id)
  if not reg:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Ingreso no encontrado",
    )
  repo.eliminar(reg)
