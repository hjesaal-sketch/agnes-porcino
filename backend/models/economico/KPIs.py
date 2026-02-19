# backend/models/economico/KPIs.py
from pydantic import BaseModel


class KPIsEconomico(BaseModel):
    totalIngresos: float
    totalEgresos: float
    totalCostos: float
    totalImpuestos: float
    costosFijos: float
    costosVariables: float
    impuestosPendientes: int
    impuestosPagados: int
    saldoFinal: float
