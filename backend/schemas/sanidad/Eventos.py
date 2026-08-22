# backend/schemas/sanidad/Eventos.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class SanidadEventoBase(BaseModel):
    empresa_id: int
    granja_id: int
    tipo_animal: str  # 'hembra' o 'verraco'
    animal_id: int
    tipo: str  # 'vacunacion', 'desparasitacion', 'tratamiento'
    fecha: date
    insumo_id: int
    dosis: Optional[float] = None
    unidad: Optional[str] = None
    via_aplicacion: Optional[str] = None
    lote_medicamento: Optional[str] = None
    tecnico: Optional[str] = None
    observaciones: Optional[str] = None
    cantidad_consumida: Optional[float] = None
    costo_total: Optional[float] = None

class SanidadEventoCreate(SanidadEventoBase):
    pass

class SanidadEventoResponse(SanidadEventoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True