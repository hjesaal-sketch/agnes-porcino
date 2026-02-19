from pydantic import BaseModel
from typing import Optional
from datetime import date

class GestacionBase(BaseModel):
    madre_id: str
    raza: str
    fecha_monta: date
    fecha_diagnostico: Optional[date] = None
    fecha_probable_parto: Optional[date] = None
    resultado: Optional[str] = None
    observaciones: Optional[str] = None

class GestacionCreate(GestacionBase):
    pass

class GestacionUpdate(GestacionBase):
    pass

class GestacionInDBBase(GestacionBase):
    id: int
    class Config:
        orm_mode = True

class Gestacion(GestacionInDBBase):
    pass
