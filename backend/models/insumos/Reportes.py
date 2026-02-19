# backend/models/insumos/Reportes.py
from datetime import datetime
from typing import List

from pydantic import BaseModel

from backend.models.insumos.Medicamentos import MedicamentoRead
from backend.models.insumos.Limpieza import ProductoLimpiezaRead
from backend.models.insumos.Alimentos import AlimentoRead
from backend.models.insumos.Generales import InsumoGeneralRead
from backend.models.insumos.Equipos import EquipoRead
from backend.models.insumos.Costos import CostoRead


class ResumenInsumos(BaseModel):
    generated_at: datetime
    empresa_id: int
    granja_id: int

    medicamentos: List[MedicamentoRead]
    limpieza: List[ProductoLimpiezaRead]
    alimentos: List[AlimentoRead]
    generales: List[InsumoGeneralRead]
    equipos: List[EquipoRead]
    costos: List[CostoRead]
