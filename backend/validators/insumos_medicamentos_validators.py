# backend/validators/insumos_medicamentos_validators.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional


@dataclass(frozen=True)
class DatosMedicamento:
    empresa_id: int
    granja_id: int
    nombre: str
    tipo: str
    lote: str
    stock: float
    unidad: str
    vencimiento: Optional[date] = None
    especie: Optional[str] = None
    producto: Optional[str] = None
    peso_kg: Optional[float] = None
    edad_dias: Optional[int] = None
    dosis: Optional[float] = None
    tiempo_retiro_dias: Optional[int] = None


class MedicamentoValidationError(ValueError):
    """Errores de validación de reglas de negocio para medicamentos."""


class MedicamentosValidators:
    """
    Reglas de negocio para el módulo de Medicamentos:
    - No stock negativo.
    - Medicamento no vencido.
    - (Placeholder) Dosis por peso/edad.
    - (Placeholder) Tiempos de retiro por especie/producto.
    """

    @staticmethod
    def validar_stock_no_negativo(stock: float) -> None:
        if stock < 0:
            raise MedicamentoValidationError(
                "El stock de medicamento no puede ser negativo."
            )

    @staticmethod
    def validar_no_vencido(vencimiento: Optional[date], hoy: Optional[date] = None) -> None:
        if vencimiento is None:
            return
        if hoy is None:
            hoy = date.today()
        if vencimiento < hoy:
            raise MedicamentoValidationError(
                f"El medicamento está vencido (fecha de vencimiento: {vencimiento})."
            )

    @staticmethod
    def validar_dosis_por_peso_edad(
        tipo: str,
        especie: Optional[str],
        peso_kg: Optional[float],
        edad_dias: Optional[int],
        dosis: Optional[float],
    ) -> None:
        """
        Placeholder de dosis por peso/edad.
        Por ahora solo valida que, si viene una dosis, sea > 0.
        Cuando definas tablas de dosificación, aquí se aplican.
        """
        if dosis is not None and dosis <= 0:
            raise MedicamentoValidationError(
                "La dosis aplicada debe ser mayor que cero."
            )
        # Si en este flujo solo manejas inventario y no administraciones,
        # esta regla quedará como no restrictiva salvo el chequeo anterior.

    @staticmethod
    def validar_tiempo_retiro(
        especie: Optional[str],
        producto: Optional[str],
        tiempo_retiro_dias: Optional[int],
    ) -> None:
        """
        Placeholder de tiempos de retiro.
        Por ahora solo valida que, si se indica un tiempo de retiro, sea >= 0.
        Más adelante puedes mapear retiros mínimos por especie/producto.
        """
        if tiempo_retiro_dias is not None and tiempo_retiro_dias < 0:
            raise MedicamentoValidationError(
                "El tiempo de retiro no puede ser negativo."
            )

    @staticmethod
    def validar_medicamento(datos: DatosMedicamento) -> None:
        """
        Punto de entrada principal de validación para un registro de medicamento.
        Aplica las reglas básicas.
        """
        MedicamentosValidators.validar_stock_no_negativo(datos.stock)
        MedicamentosValidators.validar_no_vencido(datos.vencimiento)

        MedicamentosValidators.validar_dosis_por_peso_edad(
            tipo=datos.tipo,
            especie=datos.especie,
            peso_kg=datos.peso_kg,
            edad_dias=datos.edad_dias,
            dosis=datos.dosis,
        )

        MedicamentosValidators.validar_tiempo_retiro(
            especie=datos.especie,
            producto=datos.producto,
            tiempo_retiro_dias=datos.tiempo_retiro_dias,
        )
