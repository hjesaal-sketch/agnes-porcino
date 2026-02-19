# backend/models/granja/Reportes.py
from typing import List
from pydantic import BaseModel

from backend.models.granja.Infraestructura import ZonaGranjaRead
from backend.models.granja.Instalaciones import InstalacionGranjaRead
from backend.models.granja.Servicios import ServicioGranjaRead
from backend.models.granja.Equipos import EquipoGranjaRead
from backend.models.granja.Personal import PersonalGranjaRead
from backend.models.granja.Documentacion import DocumentoRead
from backend.models.granja.Bioseguridad import EventoBioseguridadRead
from backend.models.granja.Economico import MovimientoEconomicoRead
from backend.models.granja.Entorno import EventoEntornoRead


class ResumenGranja(BaseModel):
    zonas: List[ZonaGranjaRead]
    instalaciones: List[InstalacionGranjaRead]
    servicios: List[ServicioGranjaRead]
    equipos: List[EquipoGranjaRead]
    personal: List[PersonalGranjaRead]
    documentos: List[DocumentoRead]
    bioseguridad: List[EventoBioseguridadRead]
    economia: List[MovimientoEconomicoRead]
    entorno: List[EventoEntornoRead]
