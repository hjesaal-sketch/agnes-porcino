from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.sitio3.Ingreso import IngresoSitio3Model
from backend.models.sitio3.Crecimiento import CrecimientoSitio3Model
from backend.models.sitio3.Nutricion import NutricionSitio3Model
from backend.models.sitio3.Mortalidad import MortalidadSitio3Model
from backend.models.sitio3.Comercializacion import ComercializacionSitio3Model
from pydantic import BaseModel


router = APIRouter(
    prefix="/sitio3/kpis",
    tags=["Sitio 3 - KPIs"],
)


class IngresoEngorde3(BaseModel):
    fecha: date
    lote: str
    cantidad: int
    peso_promedio: float


class RegistroCrecimiento3(BaseModel):
    fecha: date
    lote: str
    corral: str
    cantidad_pesada: int
    peso_promedio: float


class RegistroNutricion3(BaseModel):
    fecha: date
    corral: str
    lote: str
    alimento_consumido: float


class RegistroMortalidad3(BaseModel):
    fecha: date
    lote: str
    cantidad: int


class RegistroVenta3(BaseModel):
    fecha: date
    lote: str
    cantidad_vendida: int
    peso_promedio_venta: float
    precio_unitario: float


class Sitio3KpiInput(BaseModel):
    ingresos: List[IngresoEngorde3]
    crecimientos: List[RegistroCrecimiento3]
    nutricion: List[RegistroNutricion3]
    mortalidad: List[RegistroMortalidad3]
    ventas: List[RegistroVenta3]


class KpiRow(BaseModel):
    lote: str
    animales_ingresados: int
    mortalidad: int
    mortalidad_pct: float
    adg_est: Optional[float]
    fcr_est: Optional[float]
    dias_en_sitio: Optional[int]
    kg_vendidos: float
    ingreso_bruto: float


def calcular_kpis_sitio3(data: Sitio3KpiInput) -> List[KpiRow]:
    por_lote: dict[str, KpiRow] = {}

    # Ingresos
    for ing in data.ingresos:
        por_lote[ing.lote] = KpiRow(
            lote=ing.lote,
            animales_ingresados=ing.cantidad,
            mortalidad=0,
            mortalidad_pct=0.0,
            adg_est=None,
            fcr_est=None,
            dias_en_sitio=None,
            kg_vendidos=0.0,
            ingreso_bruto=0.0,
        )

    # Mortalidad
    for m in data.mortalidad:
        row = por_lote.get(m.lote)
        if not row:
            continue
        row.mortalidad += m.cantidad

    for row in por_lote.values():
        if row.animales_ingresados > 0:
            row.mortalidad_pct = (row.mortalidad / row.animales_ingresados) * 100.0

    # Crecimiento + FCR
    for c in data.crecimientos:
        ing = next((i for i in data.ingresos if i.lote == c.lote), None)
        if not ing:
            continue
        row = por_lote.get(c.lote)
        if not row:
            continue

        peso_ini = ing.peso_promedio
        peso_fin = c.peso_promedio
        dias = 7  # mismo valor demo que en el frontend

        if dias > 0 and peso_fin > peso_ini:
            row.adg_est = (peso_fin - peso_ini) / dias
            row.dias_en_sitio = dias

        total_alimento = sum(
            n.alimento_consumido for n in data.nutricion if n.lote == c.lote
        )
        kg_ganados = (peso_fin - peso_ini) * c.cantidad_pesada
        if kg_ganados > 0 and total_alimento > 0:
            row.fcr_est = total_alimento / kg_ganados

    # Ventas
    for v in data.ventas:
        row = por_lote.get(v.lote)
        if not row:
            continue
        kg = v.cantidad_vendida * v.peso_promedio_venta
        row.kg_vendidos += kg
        row.ingreso_bruto += kg * v.precio_unitario

    return list(por_lote.values())


@router.get(
    "/",
    response_model=List[KpiRow],
    summary="KPIs productivos/económicos Sitio 3 por lote",
)
def get_kpis_sitio3(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    ingresos_q = (
        db.query(IngresoSitio3Model)
        .filter(
            IngresoSitio3Model.empresa_id == empresa_id,
            IngresoSitio3Model.granja_id == granja_id,
        )
        .all()
    )
    crecimientos_q = (
        db.query(CrecimientoSitio3Model)
        .filter(
            CrecimientoSitio3Model.empresa_id == empresa_id,
            CrecimientoSitio3Model.granja_id == granja_id,
        )
        .all()
    )
    nutricion_q = (
        db.query(NutricionSitio3Model)
        .filter(
            NutricionSitio3Model.empresa_id == empresa_id,
            NutricionSitio3Model.granja_id == granja_id,
        )
        .all()
    )
    mortalidad_q = (
        db.query(MortalidadSitio3Model)
        .filter(
            MortalidadSitio3Model.empresa_id == empresa_id,
            MortalidadSitio3Model.granja_id == granja_id,
        )
        .all()
    )
    ventas_q = (
        db.query(ComercializacionSitio3Model)
        .filter(
            ComercializacionSitio3Model.empresa_id == empresa_id,
            ComercializacionSitio3Model.granja_id == granja_id,
        )
        .all()
    )

    data = Sitio3KpiInput(
        ingresos=[
            IngresoEngorde3(
                fecha=i.fecha,
                lote=i.lote,
                cantidad=i.cantidad,
                peso_promedio=i.peso_promedio,
            )
            for i in ingresos_q
        ],
        crecimientos=[
            RegistroCrecimiento3(
                fecha=c.fecha,
                lote=c.lote,
                corral=c.corral,
                cantidad_pesada=c.cantidad_pesada,
                peso_promedio=c.peso_promedio,
            )
            for c in crecimientos_q
        ],
        nutricion=[
            RegistroNutricion3(
                fecha=n.fecha,
                corral=n.corral,
                lote=n.lote,
                alimento_consumido=n.alimento_consumido,
            )
            for n in nutricion_q
        ],
        mortalidad=[
            RegistroMortalidad3(
                fecha=m.fecha,
                lote=m.lote,
                cantidad=m.cantidad,
            )
            for m in mortalidad_q
        ],
        ventas=[
            RegistroVenta3(
                fecha=v.fecha,
                lote=v.lote,
                cantidad_vendida=v.cantidad_vendida,
                peso_promedio_venta=v.peso_promedio_venta,
                precio_unitario=v.precio_unitario,
            )
            for v in ventas_q
        ],
    )

    return calcular_kpis_sitio3(data)
