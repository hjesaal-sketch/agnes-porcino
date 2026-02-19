# backend/api/insumos/Reportes.py
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.insumos.Reportes import ResumenInsumos
from backend.models.insumos.Medicamentos import MedicamentoRepository
from backend.models.insumos.Limpieza import ProductoLimpiezaRepository
from backend.models.insumos.Alimentos import AlimentoRepository
from backend.models.insumos.Generales import InsumoGeneralRepository
from backend.models.insumos.Equipos import EquipoRepository
from backend.models.insumos.Costos import CostoInsumoRepository

router = APIRouter(prefix="/insumos/reportes", tags=["Insumos - Reportes"])


def get_repos(db: Session = Depends(get_db)):
  return {
    "meds": MedicamentoRepository(db),
    "limp": ProductoLimpiezaRepository(db),
    "alim": AlimentoRepository(db),
    "gen": InsumoGeneralRepository(db),
    "eq": EquipoRepository(db),
    "cost": CostoInsumoRepository(db),
  }


@router.get(
  "/resumen",
  response_model=ResumenInsumos,
  summary="Obtener resumen global de insumos",
)
def obtener_resumen_insumos(
  empresa_id: int,
  granja_id: int,
  repos = Depends(get_repos),
):
  medicamentos = repos["meds"].listar_por_granja(empresa_id, granja_id)
  limpieza = repos["limp"].listar_por_granja(empresa_id, granja_id)
  alimentos = repos["alim"].listar_por_granja(empresa_id, granja_id)
  generales = repos["gen"].listar_por_granja(empresa_id, granja_id)
  equipos = repos["eq"].listar_por_granja(empresa_id, granja_id)
  costos = repos["cost"].listar_por_granja(empresa_id, granja_id)

  return ResumenInsumos(
    generated_at=datetime.utcnow(),
    empresa_id=empresa_id,
    granja_id=granja_id,
    medicamentos=medicamentos,
    limpieza=limpieza,
    alimentos=alimentos,
    generales=generales,
    equipos=equipos,
    costos=costos,
  )
