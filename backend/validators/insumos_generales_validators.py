# backend/validators/insumos_generales_validators.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class DatosInsumoGeneral:
    """
    DTO para validar reglas de negocio de insumos generales.

    Por ahora:
    - Controla que el stock nunca sea negativo.

    Futuro:
    - Podrá validar movimientos individuales (entrada/salida/ajuste)
      y su destino (lote, sección, servicio, etc.).
    """
    empresa_id: int
    granja_id: int
    descripcion: str
    categoria: str
    stock_resultante: float

    # Hooks para futuros movimientos:
    tipo_movimiento: Optional[str] = None   # 'entrada', 'salida', 'ajuste', etc.
    cantidad_movimiento: Optional[float] = None
    destino_tipo: Optional[str] = None      # 'lote', 'seccion', 'servicio', etc.
    destino_id: Optional[int] = None        # id del lote/sección/servicio referenciado


class InsumoGeneralValidationError(ValueError):
    """Errores de validación de reglas de negocio para insumos generales."""


class InsumosGeneralesValidators:
    """
    Reglas de negocio para insumos generales.

    Implementado:
    - Validar que el stock nunca quede negativo.

    Hooks listos:
    - Validar movimientos (entrada/salida/ajuste) con stock resultante.
    - Validar que el destino del movimiento sea válido.
    """

    # -------- Regla base: stock nunca negativo --------

    @staticmethod
    def validar_stock_no_negativo(stock_resultante: float) -> None:
        if stock_resultante < 0:
            raise InsumoGeneralValidationError(
                "El stock de insumos generales no puede ser negativo."
            )

    # -------- Hooks para movimientos --------

    @staticmethod
    def validar_movimiento_stock(
        tipo_movimiento: Optional[str],
        cantidad_movimiento: Optional[float],
        stock_actual: float,
    ) -> float:
        """
        Hook para validar un movimiento de stock (entrada/salida/ajuste).

        Comportamiento actual:
        - Si no se indica tipo_movimiento, se asume que `stock` ya es el
          stock final y solo se valida que sea >= 0.
        - Si se indica tipo_movimiento y cantidad_movimiento:
          - 'entrada' => stock_resultante = stock_actual + cantidad
          - 'salida'  => stock_resultante = stock_actual - cantidad
          - 'ajuste'  => stock_resultante = stock_actual + cantidad
                         (puede ser positivo o negativo)
        - Siempre se valida que el stock_resultante nunca sea negativo.

        Retorna:
        - stock_resultante calculado para que el caller pueda persistirlo.
        """
        if tipo_movimiento is None or cantidad_movimiento is None:
            # En este flujo, solo usamos la validación simple
            InsumosGeneralesValidators.validar_stock_no_negativo(stock_actual)
            return stock_actual

        if cantidad_movimiento < 0:
            raise InsumoGeneralValidationError(
                "La cantidad de movimiento debe ser positiva."
            )

        tipo = tipo_movimiento.lower()
        if tipo == "entrada":
            stock_resultante = stock_actual + cantidad_movimiento
        elif tipo == "salida":
            stock_resultante = stock_actual - cantidad_movimiento
        elif tipo == "ajuste":
            stock_resultante = stock_actual + cantidad_movimiento
        else:
            raise InsumoGeneralValidationError(
                f"Tipo de movimiento '{tipo_movimiento}' no es válido."
            )

        InsumosGeneralesValidators.validar_stock_no_negativo(stock_resultante)
        return stock_resultante

    @staticmethod
    def validar_destino_movimiento(
        destino_tipo: Optional[str],
        destino_id: Optional[int],
    ) -> None:
        """
        Hook para validar que los movimientos estén asociados a un destino válido
        (lote, sección, servicio, etc.).

        Comportamiento actual:
        - Si no se pasa destino_tipo/destino_id, no se aplica ninguna restricción.
        - Si se pasa uno de los dos, se exige que ambos vengan informados.

        Futuro:
        - Aquí puedes validar que el destino exista en la tabla correspondiente
          (lotes, secciones, servicios, etc.) según destino_tipo.
        """
        if destino_tipo is None and destino_id is None:
            # Sin destino explícito, no se aplica regla.
            return

        if not destino_tipo or destino_id is None:
            raise InsumoGeneralValidationError(
                "Si se indica un destino para el movimiento, deben especificarse "
                "tipo de destino y su identificador."
            )

        # EJEMPLO de extensión futura (comentado):
        #
        # destinos_validos = {"lote", "seccion", "servicio"}
        # if destino_tipo not in destinos_validos:
        #     raise InsumoGeneralValidationError(
        #         f"El tipo de destino '{destino_tipo}' no es válido."
        #     )
        #
        # Aquí podrías hacer lookups contra la BD según destino_tipo,
        # por ejemplo: verificar que el lote/servicio exista.

    # -------- Orquestador principal --------

    @staticmethod
    def validar_insumo_general(datos: DatosInsumoGeneral) -> None:
        """
        Punto de entrada principal para validar un estado de insumo general,
        incluido el resultado de un movimiento si aplica.
        """
        InsumosGeneralesValidators.validar_stock_no_negativo(
            datos.stock_resultante
        )

        # Hooks: se activan solo si se pasan datos
        InsumosGeneralesValidators.validar_destino_movimiento(
            destino_tipo=datos.destino_tipo,
            destino_id=datos.destino_id,
        )
