# backend/api/maternidad/Reportes.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Ingreso import IngresoMaternidad
from backend.models.maternidad.Partos import PartoMaternidad
from backend.models.maternidad.Lactancia import ControlLactanciaModel
from backend.models.maternidad.Mortandad import MortalidadMaternidadModel
from backend.models.maternidad.Destete import DesteteMaternidad
from backend.models.maternidad.Alertas import MaternidadAlerta
from backend.models.maternidad.Reportes import ResumenMaternidad


router = APIRouter(
    prefix="/maternidad/reportes", tags=["Maternidad - Reportes"]
)


def _cargar_resumen(
    db: Session, empresa_id: int, granja_id: int
) -> ResumenMaternidad:
    ingresos = (
        db.query(IngresoMaternidad)
        .filter(
            IngresoMaternidad.empresa_id == empresa_id,
            IngresoMaternidad.granja_id == granja_id,
        )
        .all()
    )
    partos = (
        db.query(PartoMaternidad)
        .filter(
            PartoMaternidad.empresa_id == empresa_id,
            PartoMaternidad.granja_id == granja_id,
        )
        .all()
    )
    lactancia = (
        db.query(ControlLactanciaModel)
        .filter(
            ControlLactanciaModel.empresa_id == empresa_id,
            ControlLactanciaModel.granja_id == granja_id,
        )
        .all()
    )
    mortalidad = (
        db.query(MortalidadMaternidadModel)
        .filter(
            MortalidadMaternidadModel.empresa_id == empresa_id,
            MortalidadMaternidadModel.granja_id == granja_id,
        )
        .all()
    )
    destete = (
        db.query(DesteteMaternidad)
        .filter(
            DesteteMaternidad.empresa_id == empresa_id,
            DesteteMaternidad.granja_id == granja_id,
        )
        .all()
    )
    alertas = (
        db.query(MaternidadAlerta)
        .filter(
            MaternidadAlerta.empresa_id == empresa_id,
            MaternidadAlerta.granja_id == granja_id,
        )
        .all()
    )

    return ResumenMaternidad(
        ingresos=ingresos,
        partos=partos,
        lactancia=lactancia,
        mortalidad=mortalidad,
        destete=destete,
        alertas=alertas,
    )


@router.get(
    "/resumen",
    response_model=ResumenMaternidad,
    summary="Obtener resumen de maternidad",
)
def obtener_resumen_maternidad(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    return _cargar_resumen(db, empresa_id, granja_id)


@router.get(
    "/exportar-json",
    response_class=JSONResponse,
    summary="Exportar resumen de maternidad en JSON",
)
def exportar_maternidad_json(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    resumen = _cargar_resumen(db, empresa_id, granja_id)
    contenido = jsonable_encoder(resumen)
    return JSONResponse(content=contenido)
