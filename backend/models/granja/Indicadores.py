# backend/models/granja/Indicadores.py
from pydantic import BaseModel


class KPIsGranja(BaseModel):
    totalInstalaciones: int
    totalEquipos: int
    totalServicios: int
    instalacionesOperativas: int
    activosOperativos: int
    totalPersonal: int
    personalActivo: int
    totalDocumentos: int
    totalMovimientos: int
    serviciosEnMantenimiento: int
    costosFijos: float
    costosVariables: float
    ventas: float
