// src/services/geneticaReportesService.ts
import { getVerracos } from "./geneticaReproductoresService";
import { getValoraciones } from "./geneticaValoracionService";
import { getRegistrosSeminales } from "./geneticaSeminalService";

export function obtenerResumenGenetica() {
  return {
    reproductores: getVerracos(),
    valoraciones: getValoraciones(),
    seminal: getRegistrosSeminales()
  };
}

export function exportarGeneticaJSON() {
  return JSON.stringify(obtenerResumenGenetica(), null, 2);
}
