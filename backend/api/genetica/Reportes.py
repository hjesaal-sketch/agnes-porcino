# backend/api/genetica/Reportes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from backend.database import get_db
from backend.models.genetica.Reproductores import VerracoModel, VerracoRead
from backend.models.genetica.Valoracion import (
    ValoracionGeneticaModel,
    ValoracionGeneticaRead,
)
from backend.models.genetica.Seminal import RegistroSeminalModel, RegistroSeminalRead
from backend.models.genetica.Reportes import ResumenGenetica

router = APIRouter(
    prefix="/genetica/reportes",
    tags=["Genética - Reportes"],
)


@router.get(
    "/resumen",
    response_model=ResumenGenetica,
    summary="Obtener resumen de genética",
)
def obtener_resumen_genetica(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    verracos = (
        db.query(VerracoModel)
        .filter(
            VerracoModel.empresa_id == empresa_id,
            VerracoModel.granja_id == granja_id,
        )
        .all()
    )
    valoraciones = (
        db.query(ValoracionGeneticaModel)
        .filter(
            ValoracionGeneticaModel.empresa_id == empresa_id,
            ValoracionGeneticaModel.granja_id == granja_id,
        )
        .all()
    )
    seminal = (
        db.query(RegistroSeminalModel)
        .filter(
            RegistroSeminalModel.empresa_id == empresa_id,
            RegistroSeminalModel.granja_id == granja_id,
        )
        .all()
    )

    return ResumenGenetica(
        reproductores=[VerracoRead.model_validate(v) for v in verracos],
        valoraciones=[
            ValoracionGeneticaRead.model_validate(v) for v in valoraciones
        ],
        seminal=[RegistroSeminalRead.model_validate(r) for r in seminal],
    )


@router.get(
    "/export-json",
    response_class=JSONResponse,
    summary="Exportar genética en JSON",
)
def exportar_genetica_json(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    resumen = obtener_resumen_genetica(empresa_id, granja_id, db)
    # FastAPI ya lo serializa a JSON, pero si quieres el string:
    return JSONResponse(content=resumen.model_dump())
