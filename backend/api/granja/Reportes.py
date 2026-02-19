# backend/api/granja/Reportes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from backend.database import get_db
from backend.models.granja.Reportes import ResumenGranja
from backend.models.granja.Infraestructura import ZonaGranjaRepository
from backend.models.granja.Instalaciones import InstalacionRepository
from backend.models.granja.Servicios import ServicioRepository
from backend.models.granja.Equipos import EquipoGranjaRepository
from backend.models.granja.Personal import PersonalRepository
from backend.models.granja.Documentacion import DocumentoRepository
from backend.models.granja.Bioseguridad import EventoBioseguridadRepository
from backend.models.granja.Economico import MovimientoEconomicoRepository
from backend.models.granja.Entorno import EventoEntornoRepository

router = APIRouter(
    prefix="/granja/reportes",
    tags=["Granja - Reportes"],
)


class GranjaReposResumen:
    def __init__(self, db: Session):
        self.zonas = ZonaGranjaRepository(db)
        self.instalaciones = InstalacionRepository(db)
        self.servicios = ServicioRepository(db)
        self.equipos = EquipoGranjaRepository(db)
        self.personal = PersonalRepository(db)
        self.documentos = DocumentoRepository(db)
        self.bio = EventoBioseguridadRepository(db)
        self.economia = MovimientoEconomicoRepository(db)
        self.entorno = EventoEntornoRepository(db)


def get_repos(db: Session = Depends(get_db)) -> GranjaReposResumen:
    return GranjaReposResumen(db)


@router.get(
    "/resumen",
    response_model=ResumenGranja,
    summary="Obtener resumen general de la granja",
)
def obtener_resumen_granja(
    empresa_id: int,
    granja_id: int,
    repos: GranjaReposResumen = Depends(get_repos),
):
    zonas = repos.zonas.listar_por_granja(empresa_id, granja_id)
    instalaciones = repos.instalaciones.listar_por_granja(empresa_id, granja_id)
    servicios = repos.servicios.listar_por_granja(empresa_id, granja_id)
    equipos = repos.equipos.listar_por_granja(empresa_id, granja_id)
    personal = repos.personal.listar_por_granja(empresa_id, granja_id)
    documentos = repos.documentos.listar_por_granja(empresa_id, granja_id)
    bioseguridad = repos.bio.listar_por_granja(empresa_id, granja_id)
    economia = repos.economia.listar_por_granja(empresa_id, granja_id)
    entorno = repos.entorno.listar_por_granja(empresa_id, granja_id)

    return ResumenGranja(
        zonas=zonas,
        instalaciones=instalaciones,
        servicios=servicios,
        equipos=equipos,
        personal=personal,
        documentos=documentos,
        bioseguridad=bioseguridad,
        economia=economia,
        entorno=entorno,
    )


@router.get(
    "/exportar-json",
    summary="Exportar resumen de la granja como JSON string",
)
def exportar_granja_json(
    empresa_id: int,
    granja_id: int,
    repos: GranjaReposResumen = Depends(get_repos),
):
    resumen = obtener_resumen_granja(empresa_id, granja_id, repos)
    # Devuelve el JSON pretty-print como string dentro de la respuesta
    return JSONResponse(
        content=resumen.model_dump(),
        headers={"Content-Disposition": 'attachment; filename="resumen_granja.json"'},
    )
