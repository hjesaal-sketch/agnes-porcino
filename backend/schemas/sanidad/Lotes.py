# backend/schemas/sanidad/Lotes.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SanidadLoteBase(BaseModel):
    empresa_id: int
    granja_id: int
    nombre: str
    descripcion: Optional[str] = None
    categoria: str  # 'gestacion', 'maternidad', 'recria', 'engorde'
    cantidad_animales: Optional[int] = 0

class SanidadLoteCreate(SanidadLoteBase):
    pass

class SanidadLoteResponse(SanidadLoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True