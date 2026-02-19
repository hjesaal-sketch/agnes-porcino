# backend/models/maternidad/KPIs.py
from pydantic import BaseModel

class KPIsMaternidad(BaseModel):
    totalMadres: int
    totalPartos: int
    totalLechonesVivos: int
    totalLechonesMuertos: int
    mortalidadLechones: int
    mortalidadMadres: int
    promedioLechonesVivos: str
    promedioDestetados: str
    tasaMortalidadLechones: str
    totalDestetados: int
