# backend/api/granja/Indicadores.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Indicadores import KPIsGranja
from backend.models.granja.Instalaciones import InstalacionRepository
from backend.models.granja.Equipos import EquipoGranjaRepository
from backend.models.granja.Servicios import ServicioRepository
from backend.models.granja.Personal import PersonalRepository
from backend.models.granja.Documentacion import DocumentoRepository
from backend.models.granja.Economico import MovimientoEconomicoRepository

router = APIRouter(
    prefix="/granja/indicadores",
    tags=["Granja - Indicadores"],
)


class GranjaRepos:
    def __init__(self, db: Session):
        self.inst = InstalacionRepository(db)
        self.eq = EquipoGranjaRepository(db)
        self.srv = ServicioRepository(db)
        self.per = PersonalRepository(db)
        self.doc = DocumentoRepository(db)
        self.mov = MovimientoEconomicoRepository(db)


def get_repos(db: Session = Depends(get_db)) -> GranjaRepos:
    return GranjaRepos(db)


@router.get(
    "/kpis",
    response_model=KPIsGranja,
    summary="Obtener KPIs generales de la granja",
)
def obtener_kpis_granja(
    empresa_id: int,
    granja_id: int,
    repos: GranjaRepos = Depends(get_repos),
):
    instalaciones = repos.inst.listar_por_granja(empresa_id, granja_id)
    equipos = repos.eq.listar_por_granja(empresa_id, granja_id)
    servicios = repos.srv.listar_por_granja(empresa_id, granja_id)
    personal = repos.per.listar_por_granja(empresa_id, granja_id)
    documentos = repos.doc.listar_por_granja(empresa_id, granja_id)
    movimientos = repos.mov.listar_por_granja(empresa_id, granja_id)

    totalInstalaciones = len(instalaciones)
    totalEquipos = len(equipos)
    totalServicios = len(servicios)
    totalPersonal = len(personal)
    totalMovimientos = len(movimientos)
    totalDocumentos = len(documentos)

    activosOperativos = len([e for e in equipos if e.estado == "Operativo"])
    instalacionesOperativas = len(
        [i for i in instalaciones if i.estado == "Operativa"]
    )
    personalActivo = len([p for p in personal if p.estado == "Activo"])
    serviciosEnMantenimiento = len(
        [s for s in servicios if s.estado == "Mantenimiento"]
    )

    costosFijos = sum(
        m.monto for m in movimientos if m.tipo == "Costo fijo"
    )
    costosVariables = sum(
        m.monto for m in movimientos if m.tipo == "Costo variable"
    )
    ventas = sum(m.monto for m in movimientos if m.tipo == "Venta")

    return KPIsGranja(
        totalInstalaciones=totalInstalaciones,
        totalEquipos=totalEquipos,
        totalServicios=totalServicios,
        instalacionesOperativas=instalacionesOperativas,
        activosOperativos=activosOperativos,
        totalPersonal=totalPersonal,
        personalActivo=personalActivo,
        totalDocumentos=totalDocumentos,
        totalMovimientos=totalMovimientos,
        serviciosEnMantenimiento=serviciosEnMantenimiento,
        costosFijos=costosFijos,
        costosVariables=costosVariables,
        ventas=ventas,
    )
