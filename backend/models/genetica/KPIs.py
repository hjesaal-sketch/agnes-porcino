# backend/models/genetica/KPIs.py
from pydantic import BaseModel

class KPIsGenetica(BaseModel):
    totalVerracos: int
    activos: int
    enReposo: int
    baja: int
    totalValoraciones: int
    promedioScore: str
    totalSeminales: int
    calidadExcelente: int
    calidadDeficiente: int
    promedioConcentracion: str
