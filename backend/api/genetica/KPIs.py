# backend/api/genetica/KPIs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.genetica.Reproductores import VerracoModel
from backend.models.genetica.Valoracion import ValoracionGeneticaModel
from backend.models.genetica.Seminal import RegistroSeminalModel
from backend.models.genetica.KPIs import KPIsGenetica

router = APIRouter(
    prefix="/genetica/kpis",
    tags=["Genética - KPIs"],
)

@router.get("/", response_model=KPIsGenetica)
def obtener_kpis_genetica(
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

    total_verracos = len(verracos)
    activos = len([v for v in verracos if v.estado_reproductivo == "Activo"])
    en_reposo = len([v for v in verracos if v.estado_reproductivo == "Reposo"])
    baja = len([v for v in verracos if v.estado_reproductivo == "Baja"])

    total_valoraciones = len(valoraciones)
    if total_valoraciones > 0:
        promedio_score_num = sum(v.score or 0 for v in valoraciones) / total_valoraciones
        promedio_score = f"{promedio_score_num:.2f}"
    else:
        promedio_score = "0"

    total_seminales = len(seminal)
    calidad_excelente = len([r for r in seminal if r.calidad == "Excelente"])
    calidad_deficiente = len([r for r in seminal if r.calidad == "Deficiente"])
    if total_seminales > 0:
        prom_conc_num = sum(r.concentracion or 0 for r in seminal) / total_seminales
        promedio_concentracion = f"{prom_conc_num:.1f}"
    else:
        promedio_concentracion = "0"

    return KPIsGenetica(
        totalVerracos=total_verracos,
        activos=activos,
        enReposo=en_reposo,
        baja=baja,
        totalValoraciones=total_valoraciones,
        promedioScore=promedio_score,
        totalSeminales=total_seminales,
        calidadExcelente=calidad_excelente,
        calidadDeficiente=calidad_deficiente,
        promedioConcentracion=promedio_concentracion,
    )
