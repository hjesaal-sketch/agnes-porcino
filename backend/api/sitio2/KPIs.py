# backend/api/sitio2/KPIs.py
from datetime import date
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio2.Ingreso import IngresoRepository, IngresoRead
from backend.models.sitio2.Crecimiento import CrecimientoRepository, CrecimientoRead
from backend.models.sitio2.Nutricion import NutricionRepository, NutricionRead
from backend.models.sitio2.Mortalidad import MortalidadRepository, MortalidadRead
from backend.models.sitio2.Comercializacion import (
    ComercializacionRepository,
    ComercializacionRead,
)

from pydantic import BaseModel

router = APIRouter(
    prefix="/sitio2/kpis",
    tags=["Sitio 2 - KPIs"],
)


class Sitio2IngresoItem(BaseModel):
    fecha: date
    lote: str
    cantidad: int
    peso_promedio: float


class Sitio2CrecimientoItem(BaseModel):
    fecha: date
    lote: str
    corral: str
    cantidad_pesada: int
    peso_promedio: float


class Sitio2NutricionItem(BaseModel):
    fecha: date
    corral: str
    lote: str
    alimento_consumido: float


class Sitio2MortalidadItem(BaseModel):
    fecha: date
    lote: str
    cantidad: int


class Sitio2VentaItem(BaseModel):
    fecha: date
    lote: str
    cantidad_vendida: int
    peso_promedio_venta: float


class Sitio2KpiInput(BaseModel):
    ingresos: List[Sitio2IngresoItem]
    crecimientos: List[Sitio2CrecimientoItem]
    nutricion: List[Sitio2NutricionItem]
    mortalidad: List[Sitio2MortalidadItem]
    ventas: List[Sitio2VentaItem]


@router.get(
    "/input",
    response_model=Sitio2KpiInput,
    summary="Datos base para KPIs Sitio 2",
)
def get_kpi_input(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    ingresos_repo = IngresoRepository(db)
    crec_repo = CrecimientoRepository(db)
    nutr_repo = NutricionRepository(db)
    mort_repo = MortalidadRepository(db)
    com_repo = ComercializacionRepository(db)

    ingresos: List[IngresoRead] = ingresos_repo.listar_por_granja(
        empresa_id, granja_id
    )
    crecimientos: List[CrecimientoRead] = crec_repo.listar_por_granja(
        empresa_id, granja_id
    )
    nutricion: List[NutricionRead] = nutr_repo.listar_por_granja(
        empresa_id, granja_id
    )
    mortalidad: List[MortalidadRead] = mort_repo.listar_por_granja(
        empresa_id, granja_id
    )
    ventas: List[ComercializacionRead] = com_repo.listar_por_granja(
        empresa_id, granja_id
    )

    return Sitio2KpiInput(
        ingresos=[
            Sitio2IngresoItem(
                fecha=i.fecha,
                lote=i.lote,
                cantidad=i.cantidad,
                peso_promedio=i.peso_promedio,
            )
            for i in ingresos
        ],
        crecimientos=[
            Sitio2CrecimientoItem(
                fecha=c.fecha,
                lote=c.lote,
                corral=c.corral,
                cantidad_pesada=c.cantidad_pesada,
                peso_promedio=c.peso_promedio,
            )
            for c in crecimientos
        ],
        nutricion=[
            Sitio2NutricionItem(
                fecha=n.fecha,
                corral=n.corral,
                lote=n.lote,
                alimento_consumido=n.alimento_consumido,
            )
            for n in nutricion
        ],
        mortalidad=[
            Sitio2MortalidadItem(
                fecha=m.fecha,
                lote=m.lote,
                cantidad=m.cantidad,
            )
            for m in mortalidad
        ],
        ventas=[
            Sitio2VentaItem(
                fecha=v.fecha,
                lote=v.lote,
                cantidad_vendida=v.cantidad_vendida,
                peso_promedio_venta=v.peso_promedio_venta,
            )
            for v in ventas
        ],
    )
