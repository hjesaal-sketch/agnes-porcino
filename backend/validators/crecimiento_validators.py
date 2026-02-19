# backend/validators/crecimiento_validators.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from sqlalchemy.orm import Session

from backend.models.sitio2.Corrales import CorralSitio2Model


@dataclass(frozen=True)
class DatosIngresoSitio:
    empresa_id: int
    granja_id: int
    lote: str
    corral_destino: str
    cantidad: int
    peso_promedio: float


@dataclass(frozen=True)
class DatosMortalidadSitio:
    empresa_id: int
    granja_id: int
    lote: str
    corral: str
    cantidad: int
    tipo: str  # "Mortalidad" | "Descarte"


@dataclass(frozen=True)
class DatosCrecimientoSitio:
    empresa_id: int
    granja_id: int
    lote: str
    corral: str
    cantidad_pesada: int
    peso_promedio: float


class CrecimientoValidationError(ValueError):
    """Errores de validación de reglas de negocio en crecimiento/engorde."""


class CrecimientoValidators:
    """
    Cerebro de reglas de negocio para Sitio 2/3:
    - Altas (ingresos a corral)
    - Bajas (mortalidad/descartes)
    - Pesajes de crecimiento
    """

    # --------- Utilidades comunes ---------

    @staticmethod
    def _obtener_corral(
        db: Session,
        empresa_id: int,
        granja_id: int,
        codigo_corral: str,
    ) -> CorralSitio2Model | None:
        return (
            db.query(CorralSitio2Model)
            .filter(
                CorralSitio2Model.empresa_id == empresa_id,
                CorralSitio2Model.granja_id == granja_id,
                CorralSitio2Model.codigo == codigo_corral,
            )
            .first()
        )

    # --------- Ingresos ---------

    @staticmethod
    def validar_ingreso(
        db: Session,
        datos: DatosIngresoSitio,
    ) -> None:
        """
        Reglas:
        - Cantidad > 0, peso_promedio > 0.
        - Corral destino debe existir en la misma empresa/granja.
        - No permitir ingresar más animales que la capacidad disponible del corral.
        """
        if datos.cantidad <= 0:
            raise CrecimientoValidationError(
                "La cantidad de animales a ingresar debe ser mayor que cero."
            )
        if datos.peso_promedio <= 0:
            raise CrecimientoValidationError(
                "El peso promedio de ingreso debe ser mayor que cero."
            )

        corral = CrecimientoValidators._obtener_corral(
            db=db,
            empresa_id=datos.empresa_id,
            granja_id=datos.granja_id,
            codigo_corral=datos.corral_destino,
        )
        if corral is None:
            raise CrecimientoValidationError(
                "El corral de destino no existe en esta empresa/granja."
            )

        capacidad_disponible = max(corral.capacidad - corral.ocupacion_actual, 0)
        if datos.cantidad > capacidad_disponible:
            raise CrecimientoValidationError(
                "La cantidad a ingresar excede la capacidad disponible del corral."
            )

    # --------- Mortalidad / descartes ---------

    @staticmethod
    def validar_mortalidad(
        db: Session,
        datos: DatosMortalidadSitio,
    ) -> None:
        """
        Reglas:
        - Cantidad > 0.
        - Tipo válido: Mortalidad | Descarte.
        - Corral debe existir.
        - No permitir registrar más bajas que la ocupación actual del corral.
        """
        if datos.cantidad <= 0:
            raise CrecimientoValidationError(
                "La cantidad de bajas debe ser mayor que cero."
            )

        if datos.tipo not in {"Mortalidad", "Descarte"}:
            raise CrecimientoValidationError(
                "El tipo de baja debe ser 'Mortalidad' o 'Descarte'."
            )

        corral = CrecimientoValidators._obtener_corral(
            db=db,
            empresa_id=datos.empresa_id,
            granja_id=datos.granja_id,
            codigo_corral=datos.corral,
        )
        if corral is None:
            raise CrecimientoValidationError(
                "El corral indicado no existe en esta empresa/granja."
            )

        if datos.cantidad > corral.ocupacion_actual:
            raise CrecimientoValidationError(
                "La cantidad de bajas no puede superar la ocupación actual del corral."
            )

    # --------- Pesajes de crecimiento ---------

    @staticmethod
    def validar_crecimiento(
        db: Session,
        datos: DatosCrecimientoSitio,
    ) -> None:
        """
        Reglas:
        - cantidad_pesada > 0, peso_promedio > 0.
        - Corral debe existir.
        - No pesar más animales de los que hay en el corral.
        """
        if datos.cantidad_pesada <= 0:
            raise CrecimientoValidationError(
                "La cantidad de animales pesados debe ser mayor que cero."
            )
        if datos.peso_promedio <= 0:
            raise CrecimientoValidationError(
                "El peso promedio registrado debe ser mayor que cero."
            )

        corral = CrecimientoValidators._obtener_corral(
            db=db,
            empresa_id=datos.empresa_id,
            granja_id=datos.granja_id,
            codigo_corral=datos.corral,
        )
        if corral is None:
            raise CrecimientoValidationError(
                "El corral indicado no existe en esta empresa/granja."
            )

        if datos.cantidad_pesada > corral.ocupacion_actual:
            raise CrecimientoValidationError(
                "No se pueden pesar más animales de los que hay en el corral."
            )
