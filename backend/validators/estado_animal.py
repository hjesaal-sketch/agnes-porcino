# backend/validators/estado_animal.py

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Literal, Mapping, Set


# Estados productivos que manejará AGNES
EstadoMadre = Literal["Reemplazo", "Gestante", "Maternidad", "Vacía", "Baja"]

# Mapa explícito de transiciones permitidas
_SALTOS_PERMITIDOS: Mapping[EstadoMadre, Set[EstadoMadre]] = {
    "Reemplazo": {"Gestante", "Vacía", "Baja"},
    "Gestante": {"Maternidad", "Vacía", "Baja"},
    "Maternidad": {"Vacía", "Baja"},
    "Vacía": {"Gestante", "Baja"},
    "Baja": set(),
}


@dataclass(frozen=True)
class DatosMadre:
    """
    DTO desacoplado de SQLAlchemy para validar reglas de negocio.
    Si algo no existe hoy en BD (paridad, empresa_id, etc.) lo agregas luego.
    """

    id: int | None
    empresa_id: int | None
    granja_id: int
    identificacion: str
    fecha_nacimiento: date | None
    estado_actual: EstadoMadre
    activo: bool
    paridad: int | None
    fecha_alta: date | None
    causa_baja: str | None = None


class EstadoAnimalError(ValueError):
    """Error de validación de ciclo de vida de madre (alta, estado, baja)."""


class EstadoAnimalValidators:
    """
    Cerebro de reglas de alta, cambios de estado y bajas para Madre (sows).
    Trabaja siempre con DatosMadre, nunca importa modelos SQLAlchemy.
    """

    # --------- Alta de madre ---------

    @staticmethod
    def validar_alta(
        madre_nueva: DatosMadre,
        identificaciones_existentes: Iterable[str],
        hoy: date,
        edad_minima_meses: int = 6,
    ) -> None:
        # Identificación única
        if madre_nueva.identificacion in identificaciones_existentes:
            raise EstadoAnimalError(
                f"Ya existe una madre con la identificación "
                f"'{madre_nueva.identificacion}' en esta granja."
            )

        # Fecha de nacimiento coherente
        if madre_nueva.fecha_nacimiento:
            if madre_nueva.fecha_nacimiento > hoy:
                raise EstadoAnimalError(
                    "La fecha de nacimiento no puede estar en el futuro."
                )

            edad_dias = (hoy - madre_nueva.fecha_nacimiento).days
            if edad_dias < edad_minima_meses * 30:
                raise EstadoAnimalError(
                    "La hembra no cumple la edad mínima para ingresar al plantel."
                )

        # Estado válido
        estado = madre_nueva.estado_actual
        if estado not in {"Reemplazo", "Gestante", "Maternidad", "Vacía", "Baja"}:
            raise EstadoAnimalError(
                f"Estado inicial '{estado}' no es válido para una madre."
            )

        # Coherencia paridad ↔ estado
        paridad = madre_nueva.paridad or 0

        if paridad == 0:
            # Nunca ha parido
            if estado == "Maternidad":
                raise EstadoAnimalError(
                    "Una hembra sin partos previos no puede iniciar en 'Maternidad'."
                )
        else:
            # Multípara: ya parió al menos una vez
            if estado == "Reemplazo":
                raise EstadoAnimalError(
                    "Una hembra con partos previos no puede tener estado 'Reemplazo'."
                )

    # --------- Cambios de estado ---------

    @staticmethod
    def validar_cambio_estado(
        madre: DatosMadre,
        nuevo_estado: EstadoMadre,
    ) -> None:
        """
        Versión pura que trabaja con DatosMadre (útil para repos, tests, jobs, etc.).
        """
        estado_actual = madre.estado_actual

        # No cambiar si ya está de baja
        if estado_actual == "Baja" or not madre.activo:
            raise EstadoAnimalError(
                "No se puede cambiar el estado de una hembra dada de baja."
            )

        # Reglas de grafo
        permitidos = _SALTOS_PERMITIDOS.get(estado_actual, set())
        if nuevo_estado not in permitidos:
            raise EstadoAnimalError(
                f"Cambio de estado no permitido: {estado_actual} → {nuevo_estado}."
            )

        # Reglas adicionales según paridad
        paridad = madre.paridad or 0

        # Una hembra que ya parió no puede volver a Reemplazo
        if paridad > 0 and nuevo_estado == "Reemplazo":
            raise EstadoAnimalError(
                "Una hembra con partos previos no puede cambiar a 'Reemplazo'."
            )

        # Una hembra sin partos no debería ir directo a 'Maternidad'
        if paridad == 0 and nuevo_estado == "Maternidad":
            raise EstadoAnimalError(
                "Una hembra sin partos previos no puede ir directo a 'Maternidad'."
            )

    # --------- Baja / reactivación ---------

    @staticmethod
    def validar_baja(
        madre: DatosMadre,
        causa_baja: str | None,
    ) -> None:
        """
        - No se puede dar de baja dos veces.
        - Requiere causa de baja.
        """
        if madre.estado_actual == "Baja" or madre.activo is False:
            raise EstadoAnimalError("La hembra ya se encuentra de baja.")

        if not causa_baja or not causa_baja.strip():
            raise EstadoAnimalError("Debe especificarse una causa de baja.")

    @staticmethod
    def validar_reactivacion(madre: DatosMadre) -> None:
        """
        Si algún día permites reactivar, aquí se regula.
        Por ahora: está prohibido.
        """
        raise EstadoAnimalError(
            "No se permite reactivar una hembra dada de baja."
        )
