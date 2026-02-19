// src/services/genetica/Reportes.ts
import API_BASE from "../../config/api";
import { Verraco } from "./Reproductores";
import { ValoracionGenetica } from "./Valoracion";
import { RegistroSeminal } from "./Seminal";

export type ResumenGenetica = {
  reproductores: Verraco[];
  valoraciones: ValoracionGenetica[];
  seminal: RegistroSeminal[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function obtenerResumenGenetica(): Promise<ResumenGenetica> {
  const res = await fetch(
    `${API_BASE}/genetica/reportes/resumen?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener resumen de genética");
  }
  return res.json();
}

export async function exportarGeneticaJSON(): Promise<string> {
  const res = await fetch(
    `${API_BASE}/genetica/reportes/export-json?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al exportar genética");
  }
  // si el backend devuelve el objeto, aquí lo serializas:
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}
