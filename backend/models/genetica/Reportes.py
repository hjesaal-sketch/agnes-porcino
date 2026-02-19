# backend/models/genetica/Reportes.py
from typing import List
from pydantic import BaseModel

from backend.models.genetica.Reproductores import VerracoRead
from backend.models.genetica.Valoracion import ValoracionGeneticaRead
from backend.models.genetica.Seminal import RegistroSeminalRead


class ResumenGenetica(BaseModel):
    reproductores: List[VerracoRead]
    valoraciones: List[ValoracionGeneticaRead]
    seminal: List[RegistroSeminalRead]
