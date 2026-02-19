# backend/api/economico/Reportes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

from backend.database import get_db
from backend.models.economico.Reportes import ResumenEconomico
from backend.models.economico.Ingresos import IngresoRepository
from backend.models.economico.Egresos import EgresoRepository
from backend.models.economico.Costos import CostoRepository
from backend.models.economico.Impuestos import ImpuestoRepository

router = APIRouter(
    prefix="/economico/reportes",
    tags=["Económico - Reportes"],
)


@router.get(
    "/resumen",
    response_model=ResumenEconomico,
    summary="Obtener resumen económico completo",
)
def obtener_resumen_economico(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    ingresos_repo = IngresoRepository(db)
    egresos_repo = EgresoRepository(db)
    costos_repo = CostoRepository(db)
    impuestos_repo = ImpuestoRepository(db)

    ingresos = ingresos_repo.listar(empresa_id, granja_id)
    egresos = egresos_repo.listar(empresa_id, granja_id)
    costos = costos_repo.listar(empresa_id, granja_id)
    impuestos = impuestos_repo.listar(empresa_id, granja_id)

    return ResumenEconomico(
        ingresos=ingresos,
        egresos=egresos,
        costos=costos,
        impuestos=impuestos,
    )


@router.get(
    "/exportar",
    response_model=str,
    summary="Exportar datos económicos en JSON",
)
def exportar_economico_json(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    ingresos_repo = IngresoRepository(db)
    egresos_repo = EgresoRepository(db)
    costos_repo = CostoRepository(db)
    impuestos_repo = ImpuestoRepository(db)

    datos = {
        "ingresos": ingresos_repo.listar(empresa_id, granja_id),
        "egresos": egresos_repo.listar(empresa_id, granja_id),
        "costos": costos_repo.listar(empresa_id, granja_id),
        "impuestos": impuestos_repo.listar(empresa_id, granja_id),
    }

    return json.dumps(
        datos,
        default=str,
        ensure_ascii=False,
        indent=2,
    )
