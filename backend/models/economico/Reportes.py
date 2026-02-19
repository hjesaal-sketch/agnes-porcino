# backend/models/economico/Reportes.py
from datetime import datetime, date
from typing import List

from pydantic import BaseModel

from backend.models.economico.Ingresos import IngresoRead
from backend.models.economico.Egresos import EgresoRead
from backend.models.economico.Costos import CostoRead
from backend.models.economico.Impuestos import ImpuestoRead


class ResumenEconomico(BaseModel):
  ingresos: List[IngresoRead]
  egresos: List[EgresoRead]
  costos: List[CostoRead]
  impuestos: List[ImpuestoRead]
