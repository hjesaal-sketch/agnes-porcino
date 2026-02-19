# backend/models/animales/Resumen.py
from __future__ import annotations

from typing import List
from pydantic import BaseModel


class ResumenModulo(BaseModel):
    modulo: str
    cantidad: int


class ResumenAnimales(BaseModel):
    total: int
    modulos: List[ResumenModulo]
