# backend/validators/maternidad_validators.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable

from sqlalchemy.orm import Session

from backend.models.gestacion.Madres import Madre
from backend.models.gestacion.Servicios import ServicioGestacion
from backend.models.gestacion.Partos import PartoProgramado
from backend.validators.gestacion_validators import (
    GestacionValidators,
    GestacionValidationError,
)


@dataclass(frozen=True)
class DatosPartoMaternidad:
    empresa_id: int
    granja_id: int
    fecha_parto: date
    identificacion_madre: str
    nacidos_vivos: int
    nacidos_muertos: int
    lechones_viables: int
    peso_total: float
    parto_programado_id: int | None = None


class MaternidadValidationError(ValueError):
    """Errores de validación de reglas de negocio en Maternidad."""


class MaternidadValidators:
    """
    Cerebro de reglas de negocio para el módulo de Maternidad.
    Por ahora: validación de partos (nacidos vivos/muertos, viabilidad, etc.)
    y consistencia de fechas y referencias contra la historia de gestación.
    """

    @staticmethod
    def _obtener_madre(
        db: Session,
        granja_id: int,
        identificacion_madre: str,
    ) -> Madre | None:
        return (
            db.query(Madre)
            .filter(
                Madre.granjaid == granja_id,
                Madre.identificacion == identificacion_madre,
            )
            .first()
        )

    @staticmethod
    def _obtener_ultima_fecha_servicio(
        db: Session,
        madre: Madre,
    ) -> date | None:
        """
        Devuelve la fecha del último servicio registrado para esta madre.
        """
        servicio: ServicioGestacion | None = (
            db.query(ServicioGestacion)
            .filter(
                ServicioGestacion.sowid == madre.id,
                ServicioGestacion.granjaid == madre.granjaid,
            )
            .order_by(ServicioGestacion.fecha.desc())
            .first()
        )
        return servicio.fecha if servicio is not None else None

    @staticmethod
    def _validar_parto_programado(
        db: Session,
        madre: Madre,
        granja_id: int,
        parto_programado_id: int | None,
    ) -> None:
        """
        Si se indica parto_programado_id:
        - Debe existir.
        - Debe pertenecer a la misma granja.
        - Debe estar vinculado a la misma madre.
        """
        if parto_programado_id is None:
            return

        parto_prog: PartoProgramado | None = (
            db.query(PartoProgramado)
            .filter(
                PartoProgramado.id == parto_programado_id,
                PartoProgramado.granja_id == granja_id,
            )
            .first()
        )
        if parto_prog is None:
            raise MaternidadValidationError(
                "El parto programado indicado no existe o no pertenece a la granja."
            )

        if parto_prog.sow_id != madre.id:
            raise MaternidadValidationError(
                "El parto programado indicado no corresponde a la misma madre."
            )

    @staticmethod
    def validar_parto(
        db: Session,
        datos: DatosPartoMaternidad,
    ) -> None:
        """
        Reglas básicas:
        - La madre debe existir en la granja.
        - No se permiten cantidades negativas.
        - lechones_viables <= nacidos_vivos.
        - peso_total > 0.
        - Si nacidos_vivos es 0, lechones_viables debe ser 0.

        Reglas de fechas:
        - La fecha de parto no puede ser futura.
        - La fecha de parto no puede ser anterior a la fecha de alta de la madre.
        - Orden lógico de eventos: servicio < parto (si existe servicio).

        Reglas de referencias:
        - Si se indica parto_programado_id, debe existir, ser de la misma granja
          y corresponder a la misma madre.
        """

        # Madre existente en la granja
        madre = MaternidadValidators._obtener_madre(
            db=db,
            granja_id=datos.granja_id,
            identificacion_madre=datos.identificacion_madre,
        )
        if madre is None:
            raise MaternidadValidationError(
                "La madre indicada no existe en la granja. "
                "Debe registrarse previamente en gestación."
            )

        # Validar referencia de parto programado (si viene)
        MaternidadValidators._validar_parto_programado(
            db=db,
            madre=madre,
            granja_id=datos.granja_id,
            parto_programado_id=datos.parto_programado_id,
        )

        # -------- Validaciones de fechas --------
        # 1) No futura
        try:
            GestacionValidators.validar_fecha_no_futura(datos.fecha_parto)
        except GestacionValidationError as exc:
            raise MaternidadValidationError(str(exc))

        # 2) Después de fecha de alta de la madre (si la tiene)
        if madre.fecha_alta:
            try:
                GestacionValidators.validar_fecha_despues_de_alta(
                    fecha_evento=datos.fecha_parto,
                    fecha_alta=madre.fecha_alta,
                    contexto="parto",
                )
            except GestacionValidationError as exc:
                raise MaternidadValidationError(str(exc))

        # 3) Orden lógico servicio < parto (si hay servicios)
        ultima_fecha_servicio = MaternidadValidators._obtener_ultima_fecha_servicio(
            db=db,
            madre=madre,
        )
        if ultima_fecha_servicio is not None:
            try:
                GestacionValidators.validar_orden_eventos_gestacion(
                    fecha_servicio=ultima_fecha_servicio,
                    fecha_parto=datos.fecha_parto,
                )
            except GestacionValidationError as exc:
                raise MaternidadValidationError(str(exc))

        # -------- Validaciones de cantidades --------
        if datos.nacidos_vivos < 0:
            raise MaternidadValidationError(
                "El número de nacidos vivos no puede ser negativo."
            )
        if datos.nacidos_muertos < 0:
            raise MaternidadValidationError(
                "El número de nacidos muertos no puede ser negativo."
            )
        if datos.lechones_viables < 0:
            raise MaternidadValidationError(
                "El número de lechones viables no puede ser negativo."
            )
        if datos.peso_total <= 0:
            raise MaternidadValidationError(
                "El peso total de la camada debe ser mayor que cero."
            )

        total_nacidos = datos.nacidos_vivos + datos.nacidos_muertos
        if total_nacidos <= 0:
            raise MaternidadValidationError(
                "La suma de nacidos vivos y muertos debe ser mayor que cero."
            )

        if datos.lechones_viables > datos.nacidos_vivos:
            raise MaternidadValidationError(
                "Los lechones viables no pueden superar a los nacidos vivos."
            )

        if datos.nacidos_vivos == 0 and datos.lechones_viables != 0:
            raise MaternidadValidationError(
                "Si no hay nacidos vivos, los lechones viables deben ser cero."
            )
