# backend/validators/gestacion_validators.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from backend.models.genetica.Reproductores import (
    VerracoRepository,
    VerracoModel,
)
from backend.models.gestacion.Madres import Madre


@dataclass(frozen=True)
class DatosServicioGestacion:
    """
    DTO desacoplado de SQLAlchemy para validar reglas de negocio
    al registrar/actualizar un servicio de gestación.
    """

    empresa_id: int
    granja_id: int
    verraco_id: str
    identificacion_madre: str | None = None
    sow_id: int | None = None
    tipo_servicio: str | None = None
    resultado: str | None = None
    fecha_servicio: date | None = None


@dataclass(frozen=True)
class DatosEventoParto:
    """
    DTO para validar eventos de maternidad (partos, destetes).
    """

    sow_id: int
    granja_id: int
    fecha_evento: date
    tipo_evento: str  # 'parto', 'destete', etc.
    fecha_alta_madre: date | None = None


class GestacionValidationError(ValueError):
    """Errores de validación de reglas de negocio en gestación."""


class GestacionValidators:
    """
    Cerebro de reglas de negocio para el módulo de Gestación.
    Aquí se centralizan todas las validaciones de servicios,
    confirmaciones, abortos, partos, reinserciones, bajas, etc.
    """

    # ---------- Validadores de fechas generales ----------

    @staticmethod
    def validar_fecha_no_futura(
        fecha: date,
        hoy: date | None = None,
    ) -> None:
        if hoy is None:
            hoy = date.today()

        if fecha > hoy:
            raise GestacionValidationError(
                f"La fecha del evento ({fecha}) no puede estar en el futuro."
            )

    @staticmethod
    def validar_fecha_despues_de_alta(
        fecha_evento: date,
        fecha_alta: date,
        contexto: str = "evento",
    ) -> None:
        if fecha_evento < fecha_alta:
            raise GestacionValidationError(
                f"La fecha del {contexto} ({fecha_evento}) no puede ser anterior "
                f"a la fecha de alta de la madre ({fecha_alta})."
            )

    @staticmethod
    def validar_orden_eventos_gestacion(
        fecha_servicio: date,
        fecha_parto: date | None = None,
        hoy: date | None = None,
    ) -> None:
        if hoy is None:
            hoy = date.today()

        if fecha_parto is not None:
            if fecha_parto < fecha_servicio:
                raise GestacionValidationError(
                    f"El parto ({fecha_parto}) no puede ocurrir antes del servicio ({fecha_servicio})."
                )
            # 114 días estándar, pero dejamos como warning lógico
            dias_entre = (fecha_parto - fecha_servicio).days
            if dias_entre < 100 or dias_entre > 125:
                pass

    # ---------- Validadores de verraco ----------

    @staticmethod
    def validar_verraco_existe_y_pertenece(
        db: Session,
        empresa_id: int,
        granja_id: int,
        verraco_identificacion: str,
    ) -> None:
        repo = VerracoRepository(db)

        verracos: Iterable[VerracoModel] = repo.listar_por_granja(
            empresa_id=empresa_id,
            granja_id=granja_id,
        )

        for v in verracos:
            if str(v.identificacion) == str(verraco_identificacion):
                return

        raise GestacionValidationError(
            (
                "El verraco indicado no es válido para esta empresa/granja. "
                "Debe existir en Genética y pertenecer a la misma empresa y granja."
            )
        )

    # ---------- Utilidades de normalización ----------

    @staticmethod
    def _normalizar_estado(estado: str | None) -> str:
        """
        Normaliza el estado a un código interno:
        - Mayúsculas
        - Sin espacios alrededor
        - Sin tildes (VACÍA -> VACIA, GESTACIÓN -> GESTACION)
        """
        if not estado:
            return ""
        txt = estado.strip().upper()
        # quitar tildes comunes en español
        reemplazos = str.maketrans(
            {
                "Á": "A",
                "É": "E",
                "Í": "I",
                "Ó": "O",
                "Ú": "U",
                "Ü": "U",
            }
        )
        return txt.translate(reemplazos)

    # ---------- Validadores de madre / servicio ----------

    @staticmethod
    def validar_madre_servible(
        db: Session,
        granja_id: int,
        identificacion_madre: str,
    ) -> None:
        """
        Regla: una madre solo puede recibir servicio si:
        - Está activa.
        - Su estado_actual está en un conjunto de estados servibles.

        Estados servibles (códigos internos):
        - REEMPLAZO
        - VACIA
        - PARIDA
        - LACTANCIA

        Estados no servibles:
        - GESTACION
        - ABORTO
        - MATERNIDAD
        - BAJA
        """
        madre: Madre | None = (
            db.query(Madre)
            .filter(
                Madre.granja_id == granja_id,
                Madre.identificacion == identificacion_madre,
            )
            .first()
        )

        # Si no existe, permitimos que el repositorio la cree mínima.
        if madre is None:
            return

        if not madre.activo:
            raise GestacionValidationError(
                "No se puede registrar servicio a una hembra inactiva o dada de baja."
            )

        estado_cod = GestacionValidators._normalizar_estado(madre.estado_actual)

        estados_servibles = {
            "REEMPLAZO",
            "VACIA",
            "PARIDA",
            "LACTANCIA",
        }

        estados_no_servibles = {
            "GESTACION",
            "ABORTO",
            "MATERNIDAD",
            "BAJA",
        }

        if estado_cod in estados_no_servibles:
            raise GestacionValidationError(
                f"No se puede registrar servicio a una hembra en estado '{madre.estado_actual}'."
            )

        if estado_cod not in estados_servibles:
            raise GestacionValidationError(
                f"No se puede registrar servicio a una hembra en estado '{madre.estado_actual}'."
            )

    @staticmethod
    def validar_servicio_gestacion(
        db: Session,
        datos: DatosServicioGestacion,
        hoy: date | None = None,
    ) -> None:
        if hoy is None:
            hoy = date.today()

        if not datos.verraco_id or not str(datos.verraco_id).strip():
            raise GestacionValidationError(
                "Debe especificarse un verraco para registrar el servicio."
            )

        GestacionValidators.validar_verraco_existe_y_pertenece(
            db=db,
            empresa_id=datos.empresa_id,
            granja_id=datos.granja_id,
            verraco_identificacion=str(datos.verraco_id).strip(),
        )

        if datos.identificacion_madre:
            GestacionValidators.validar_madre_servible(
                db=db,
                granja_id=datos.granja_id,
                identificacion_madre=datos.identificacion_madre,
            )

        if datos.fecha_servicio:
            GestacionValidators.validar_fecha_no_futura(datos.fecha_servicio, hoy)

            if datos.sow_id:
                madre = db.query(Madre).filter(Madre.id == datos.sow_id).first()
                if madre and madre.fecha_alta:
                    GestacionValidators.validar_fecha_despues_de_alta(
                        fecha_evento=datos.fecha_servicio,
                        fecha_alta=madre.fecha_alta,
                        contexto="servicio",
                    )

    # ---------- Validadores de evento de parto / maternidad ----------

    @staticmethod
    def validar_evento_parto(
        db: Session,
        datos: DatosEventoParto,
        hoy: date | None = None,
    ) -> None:
        if hoy is None:
            hoy = date.today()

        GestacionValidators.validar_fecha_no_futura(datos.fecha_evento, hoy)

        madre = db.query(Madre).filter(Madre.id == datos.sow_id).first()
        if madre and madre.fecha_alta:
            GestacionValidators.validar_fecha_despues_de_alta(
                fecha_evento=datos.fecha_evento,
                fecha_alta=madre.fecha_alta,
                contexto=datos.tipo_evento,
            )
