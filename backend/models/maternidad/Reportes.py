# backend/models/maternidad/Reportes.py
from datetime import datetime
from typing import List

from pydantic import BaseModel

from backend.models.maternidad.Ingreso import IngresoRead
from backend.models.maternidad.Partos import PartoRead
from backend.models.maternidad.Lactancia import ControlLactanciaRead
from backend.models.maternidad.Mortandad import MortalidadRead
from backend.models.maternidad.Destete import DesteteRead
from backend.models.maternidad.Alertas import MaternidadAlertaRead


class ResumenMaternidad(BaseModel):
    ingresos: List[IngresoRead]
    partos: List[PartoRead]
    lactancia: List[ControlLactanciaRead]
    mortalidad: List[MortalidadRead]
    destete: List[DesteteRead]
    alertas: List[MaternidadAlertaRead]

    generated_at: datetime = datetime.utcnow()
