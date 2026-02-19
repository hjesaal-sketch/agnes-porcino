// src/services/maternidadReportesService.ts
import { getIngresos } from "./maternidadIngresoService";
import { getPartos } from "./maternidadPartosService";
import { getControles } from "./maternidadLactanciaService";
import { getRegistrosMortalidad } from "./maternidadMortandadService";
import { getRegistrosDestete } from "./maternidadDesteteService";
import { getAlertas } from "./maternidadAlertasService";

export function obtenerResumenMaternidad() {
  return {
    ingresos: getIngresos(),
    partos: getPartos(),
    lactancia: getControles(),
    mortalidad: getRegistrosMortalidad(),
    destete: getRegistrosDestete(),
    alertas: getAlertas()
  };
}

export function exportarMaternidadJSON() {
  return JSON.stringify(obtenerResumenMaternidad(), null, 2);
}
