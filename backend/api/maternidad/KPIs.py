# backend/api/maternidad/KPIs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.maternidad.Ingreso import IngresoMaternidad
from backend.models.maternidad.Partos import PartoMaternidad
from backend.models.maternidad.Lactancia import ControlLactanciaModel
from backend.models.maternidad.Mortandad import MortalidadMaternidadModel
from backend.models.maternidad.Destete import DesteteMaternidad
from backend.models.maternidad.KPIs import KPIsMaternidad

router = APIRouter(prefix="/maternidad/kpis", tags=["Maternidad - KPIs"])


@router.get("/", response_model=KPIsMaternidad)
def obtener_kpis_maternidad(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
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
    controles = (
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

    totalMadres = len(ingresos)
    totalPartos = len(partos)

    totalLechonesVivos = sum(p.nacidos_vivos or 0 for p in partos)
    totalLechonesMuertos = sum(p.nacidos_muertos or 0 for p in partos)
    totalDestetados = sum(d.lechones_destetados or 0 for d in destete)

    mortalidadLechones = sum(
        m.cantidad or 0 for m in mortalidad if m.tipo == "Lechón"
    )
    mortalidadMadres = sum(
        m.cantidad or 0 for m in mortalidad if m.tipo == "Madre"
    )

    promedioLechonesVivos = (
        f"{totalLechonesVivos / totalPartos:.2f}" if totalPartos > 0 else "0"
    )
    promedioDestetados = (
        f"{totalDestetados / len(destete):.2f}" if len(destete) > 0 else "0"
    )
    tasaMortalidadLechones = (
        f"{mortalidadLechones / totalLechonesVivos * 100:.2f}"
        if totalLechonesVivos > 0
        else "0"
    )

    return KPIsMaternidad(
        totalMadres=totalMadres,
        totalPartos=totalPartos,
        totalLechonesVivos=totalLechonesVivos,
        totalLechonesMuertos=totalLechonesMuertos,
        mortalidadLechones=mortalidadLechones,
        mortalidadMadres=mortalidadMadres,
        promedioLechonesVivos=promedioLechonesVivos,
        promedioDestetados=promedioDestetados,
        tasaMortalidadLechones=tasaMortalidadLechones,
        totalDestetados=totalDestetados,
    )
