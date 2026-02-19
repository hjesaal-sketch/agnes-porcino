// src/services/economicoReportesService.ts
import { getIngresos } from "./economicoIngresosService";
import { getEgresos } from "./economicoEgresosService";
import { getCostos } from "./economicoCostosService";
import { getImpuestos } from "./economicoImpuestosService";

export function obtenerResumenEconomico() {
  return {
    ingresos: getIngresos(),
    egresos: getEgresos(),
    costos: getCostos(),
    impuestos: getImpuestos()
  };
}

export function exportarEconomicoJSON() {
  return JSON.stringify(obtenerResumenEconomico(), null, 2);
}
