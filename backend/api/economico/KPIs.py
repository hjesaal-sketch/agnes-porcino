# backend/api/economico/KPIs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.economico.KPIs import KPIsEconomico
from backend.models.economico.Ingresos import IngresoRepository
from backend.models.economico.Egresos import EgresoRepository
from backend.models.economico.Costos import CostoRepository
from backend.models.economico.Impuestos import ImpuestoRepository

router = APIRouter(
    prefix="/economico/kpis",
    tags=["Económico - KPIs"],
)


@router.get("/", response_model=KPIsEconomico, summary="KPIs económicos")
def obtener_kpis_economico(
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

    total_ingresos = sum(i.monto or 0 for i in ingresos)
    total_egresos = sum(e.monto or 0 for e in egresos)
    total_costos = sum(c.monto or 0 for c in costos)
    total_impuestos = sum(i.monto or 0 for i in impuestos)

    costos_fijos = sum(
        c.monto or 0 for c in costos if getattr(c, "categoria", None) == "Fijo"
    )
    costos_variables = sum(
        c.monto or 0 for c in costos if getattr(c, "categoria", None) == "Variable"
    )

    impuestos_pendientes = sum(1 for i in impuestos if not i.pagado)
    impuestos_pagados = sum(1 for i in impuestos if i.pagado)

    saldo_final = total_ingresos - total_egresos - total_costos - total_impuestos

    return KPIsEconomico(
        totalIngresos=total_ingresos,
        totalEgresos=total_egresos,
        totalCostos=total_costos,
        totalImpuestos=total_impuestos,
        costosFijos=costos_fijos,
        costosVariables=costos_variables,
        impuestosPendientes=impuestos_pendientes,
        impuestosPagados=impuestos_pagados,
        saldoFinal=saldo_final,
    )
