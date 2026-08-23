# backend/api/animales/Resumen.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db

# Gestación
from backend.models.gestacion.Madres import Madre  # tu modelo real de madres gestación
from backend.models.gestacion.Servicios import ServicioGestacion  # <--- NUEVA LÍNEA

# Maternidad
from backend.models.maternidad.Ingreso import IngresoMaternidad
from backend.models.maternidad.Partos import PartoMaternidad
from backend.models.maternidad.Mortandad import MortalidadMaternidadModel
from backend.models.maternidad.Destete import DesteteMaternidad

# Sitio 2
from backend.models.sitio2.Ingreso import IngresoSitio2Model
from backend.models.sitio2.Mortalidad import MortalidadSitio2Model
from backend.models.sitio2.Comercializacion import ComercializacionSitio2Model

# Sitio 3
from backend.models.sitio3.Ingreso import IngresoSitio3Model
from backend.models.sitio3.Mortalidad import MortalidadSitio3Model
from backend.models.sitio3.Comercializacion import ComercializacionSitio3Model

# Reproductores
from backend.models.genetica.Reproductores import VerracoModel

from backend.models.animales.Resumen import ResumenAnimales, ResumenModulo


router = APIRouter(
    prefix="/animales/resumen",
    tags=["Animales - Resumen"],
)


# En el futuro, esto debe salir del token (tenant).
# Por ahora se recibe empresa_id y granja_id y se valida mínimamente.
@router.get("/", response_model=ResumenAnimales)
def obtener_resumen_animales(
    empresa_id: int,
    granja_id: int,
    db: Session = Depends(get_db),
):
    if empresa_id <= 0 or granja_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="empresa_id y granja_id deben ser mayores a 0",
        )

    modulos: list[ResumenModulo] = []

        # ========================
        # 1) Gestación (madres)
        # ========================
        # Contar MADRES EN GESTACIÓN según servicios activos
        # 1.1 Madres con servicios que tienen resultado 'Gestación confirmada' o 'Pendiente'
        # 1.2 Y que NO han tenido parto aún (no están en maternidad)
        
        # Obtener IDs de madres con servicios en gestación activa
        madres_gestacion_ids = db.query(ServicioGestacion.sow_id).filter(
            ServicioGestacion.granja_id == granja_id,
            ServicioGestacion.resultado.in_(['Gestación confirmada', 'Pendiente'])
        ).distinct().subquery()
        
        # Contar madres activas que están en gestación
        gestacion_count = (
            db.query(func.count(Madre.id))
            .filter(
                Madre.granja_id == granja_id,
                Madre.activo.is_(True),
                Madre.id.in_(madres_gestacion_ids)
            )
            .scalar()
            or 0
        )
        modulos.append(
            ResumenModulo(modulo="Gestación", cantidad=gestacion_count)
        )

    # ========================
    # 2) Maternidad
    # ========================
    # 2.1 Madres en maternidad: ingresos de maternidad de la granja.
    madres_maternidad_count = (
        db.query(func.count(IngresoMaternidad.id))
        .filter(
            IngresoMaternidad.empresa_id == empresa_id,
            IngresoMaternidad.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    # 2.2 Lechones vivos = nacidos vivos - mortalidad lechones - destetados
    # Usa el nombre real de la columna de PartoMaternidad (aquí: nacidos_vivos)
    lechones_nacidos_vivos = (
        db.query(
            func.coalesce(func.sum(PartoMaternidad.nacidos_vivos), 0)
        )
        .filter(
            PartoMaternidad.empresa_id == empresa_id,
            PartoMaternidad.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    # Mortalidad maternidad (lechones)
    lechones_muertos = (
        db.query(
            func.coalesce(
                func.sum(MortalidadMaternidadModel.cantidad),
                0,
            )
        )
        .filter(
            MortalidadMaternidadModel.empresa_id == empresa_id,
            MortalidadMaternidadModel.granja_id == granja_id,
            MortalidadMaternidadModel.tipo == "Lechón",
        )
        .scalar()
        or 0
    )

    # Destete: total de lechones destetados
    lechones_destetados = (
        db.query(
            func.coalesce(
                func.sum(DesteteMaternidad.lechones_destetados),
                0,
            )
        )
        .filter(
            DesteteMaternidad.empresa_id == empresa_id,
            DesteteMaternidad.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    lechones_vivos_actuales = max(
        lechones_nacidos_vivos - lechones_muertos - lechones_destetados, 0
    )

    maternidad_total = madres_maternidad_count + lechones_vivos_actuales
    modulos.append(
        ResumenModulo(
            modulo="Maternidad (madres + lechones)",
            cantidad=maternidad_total,
        )
    )

    # ========================
    # 3) Recría (Sitio 2)
    # ========================
    ingresos_s2 = (
        db.query(
            func.coalesce(
                func.sum(IngresoSitio2Model.cantidad),
                0,
            )
        )
        .filter(
            IngresoSitio2Model.empresa_id == empresa_id,
            IngresoSitio2Model.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    mortalidad_s2 = (
        db.query(
            func.coalesce(
                func.sum(MortalidadSitio2Model.cantidad),
                0,
            )
        )
        .filter(
            MortalidadSitio2Model.empresa_id == empresa_id,
            MortalidadSitio2Model.granja_id == granja_id,
            MortalidadSitio2Model.tipo == "Mortalidad",
        )
        .scalar()
        or 0
    )

    ventas_s2 = (
        db.query(
            func.coalesce(
                func.sum(ComercializacionSitio2Model.cantidad_vendida),
                0,
            )
        )
        .filter(
            ComercializacionSitio2Model.empresa_id == empresa_id,
            ComercializacionSitio2Model.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    recria_vivos = max(ingresos_s2 - mortalidad_s2 - ventas_s2, 0)
    modulos.append(
        ResumenModulo(modulo="Recría (Sitio 2)", cantidad=recria_vivos)
    )

    # ========================
    # 4) Engorde (Sitio 3)
    # ========================
    ingresos_s3 = (
        db.query(
            func.coalesce(
                func.sum(IngresoSitio3Model.cantidad),
                0,
            )
        )
        .filter(
            IngresoSitio3Model.empresa_id == empresa_id,
            IngresoSitio3Model.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    mortalidad_s3 = (
        db.query(
            func.coalesce(
                func.sum(MortalidadSitio3Model.cantidad),
                0,
            )
        )
        .filter(
            MortalidadSitio3Model.empresa_id == empresa_id,
            MortalidadSitio3Model.granja_id == granja_id,
            MortalidadSitio3Model.tipo == "Mortalidad",
        )
        .scalar()
        or 0
    )

    ventas_s3 = (
        db.query(
            func.coalesce(
                func.sum(ComercializacionSitio3Model.cantidad_vendida),
                0,
            )
        )
        .filter(
            ComercializacionSitio3Model.empresa_id == empresa_id,
            ComercializacionSitio3Model.granja_id == granja_id,
        )
        .scalar()
        or 0
    )

    engorde_vivos = max(ingresos_s3 - mortalidad_s3 - ventas_s3, 0)
    modulos.append(
        ResumenModulo(modulo="Engorde (Sitio 3)", cantidad=engorde_vivos)
    )

    # ========================
    # 5) Reproductores
    # ========================
    reproductores_activos = (
        db.query(func.count(VerracoModel.id))
        .filter(
            VerracoModel.empresa_id == empresa_id,
            VerracoModel.granja_id == granja_id,
            VerracoModel.estadoReproductivo != "Baja",
        )
        .scalar()
        or 0
    )
    modulos.append(
        ResumenModulo(modulo="Reproductores", cantidad=reproductores_activos)
    )

    # ========================
    # 6) Descartes en corral
    # ========================
    descartes_s2 = (
        db.query(
            func.coalesce(
                func.sum(MortalidadSitio2Model.cantidad),
                0,
            )
        )
        .filter(
            MortalidadSitio2Model.empresa_id == empresa_id,
            MortalidadSitio2Model.granja_id == granja_id,
            MortalidadSitio2Model.tipo == "Descarte",
        )
        .scalar()
        or 0
    )

    descartes_s3 = (
        db.query(
            func.coalesce(
                func.sum(MortalidadSitio3Model.cantidad),
                0,
            )
        )
        .filter(
            MortalidadSitio3Model.empresa_id == empresa_id,
            MortalidadSitio3Model.granja_id == granja_id,
            MortalidadSitio3Model.tipo == "Descarte",
        )
        .scalar()
        or 0
    )

    descartes_corral = descartes_s2 + descartes_s3
    modulos.append(
        ResumenModulo(modulo="Descartes en corral", cantidad=descartes_corral)
    )

    total = sum(m.cantidad for m in modulos)

    return ResumenAnimales(total=total, modulos=modulos)
