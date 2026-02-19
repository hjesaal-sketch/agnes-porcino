// src/services/insumosReportesService.ts
import { getMedicamentos } from "./insumosMedicamentosService";
import { getProductosLimpieza } from "./insumosLimpiezaService";
import { getAlimentos } from "./insumosAlimentosService";
import { getInsumosGenerales } from "./insumosGeneralesService";
import { getEquipos } from "./insumosEquiposService";
import { getCostos } from "./insumosCostosService";

export function obtenerResumenInsumos() {
  return {
    medicamentos: getMedicamentos(),
    limpieza: getProductosLimpieza(),
    alimentos: getAlimentos(),
    generales: getInsumosGenerales(),
    equipos: getEquipos(),
    costos: getCostos()
  };
}

export function exportarInsumosJSON() {
  return JSON.stringify(obtenerResumenInsumos(), null, 2);
}
