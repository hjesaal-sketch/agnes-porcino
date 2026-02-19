# backend/validators/insumos_alimentos_validators.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional
from datetime import date


@dataclass(frozen=True)
class DatosAlimento:
    empresa_id: int
    granja_id: int
    tipo: str
    fase: str
    cantidad: float
    stock: float
    lote: str
    unidad: str
    vencimiento: Optional[date] = None


class AlimentoValidationError(ValueError):
    """Errores de validación de reglas de negocio para alimentos."""


class AlimentosValidators:
    """
    Reglas de negocio para el módulo de Alimentos:
    - No consumos negativos ni mayores al stock.
    - Lote existente/activo (no vencido).
    - Rangos de consumo por fase (placeholder para reglas futuras).
    """

    @staticmethod
    def validar_no_consumo_negativo_ni_superior_stock(
        cantidad: float,
        stock: float,
    ) -> None:
        """
        Regla genérica:
        - cantidad >= 0
        - cantidad <= stock (si la operación representa un consumo).
        """
        if cantidad < 0:
            raise AlimentoValidationError(
                "La cantidad de alimento no puede ser negativa."
            )
        # Esta regla asume que `cantidad` es el consumo esperado en una operación.
        if cantidad > stock:
            raise AlimentoValidationError(
                "La cantidad de alimento no puede superar el stock disponible."
            )

    @staticmethod
    def validar_lote_activo(
        lote: str,
        vencimiento: Optional[date],
        hoy: Optional[date] = None,
    ) -> None:
        """
        Valida que el lote exista (no cadena vacía) y, si tiene vencimiento, que no esté vencido.
        """
        if not lote or not lote.strip():
            raise AlimentoValidationError(
                "Debe especificarse un lote de alimento válido."
            )

        if vencimiento is None:
            return

        if hoy is None:
            hoy = date.today()

        if vencimiento < hoy:
            raise AlimentoValidationError(
                f"El lote indicado está vencido (fecha de vencimiento: {vencimiento})."
            )

    @staticmethod
    def validar_rangos_consumo_por_fase(
        tipo: str,
        fase: str,
        cantidad: float,
    ) -> None:
        """
        Placeholder para rangos por fase.
        Aquí podrías implementar reglas del estilo:
        - 'Lechón'  : 0.1 - 1.0 kg/día
        - 'Recría'  : 1.0 - 2.5 kg/día
        - 'Engorde' : 2.0 - 4.0 kg/día
        Por ahora solo valida cantidad > 0.
        """
        if cantidad <= 0:
            raise AlimentoValidationError(
                "La cantidad de alimento debe ser mayor que cero."
            )

    @staticmethod
    def validar_alimento(
        datos: DatosAlimento,
    ) -> None:
        """
        Punto de entrada principal para validar un registro de alimento.
        Aplica todas las reglas básicas.
        """
        # Cantidad y stock coherentes (no negativos, no mayor que stock para consumo)
        AlimentosValidators.validar_no_consumo_negativo_ni_superior_stock(
            cantidad=datos.cantidad,
            stock=datos.stock,
        )

        # Lote existente y activo
        AlimentosValidators.validar_lote_activo(
            lote=datos.lote,
            vencimiento=datos.vencimiento,
        )

        # Rango de consumo por fase (placeholder ampliable)
        AlimentosValidators.validar_rangos_consumo_por_fase(
            tipo=datos.tipo,
            fase=datos.fase,
            cantidad=datos.cantidad,
        )
