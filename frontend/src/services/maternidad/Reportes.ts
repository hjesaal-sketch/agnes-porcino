// src/services/maternidad/Reportes.ts
import API_BASE from "../../config/api";

export type ResumenMaternidad = {
  ingresos: any[];
  partos: any[];
  mortalidad: any[];
  lactancia: any[];
  destete: any[];
  alertas: any[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function obtenerResumenMaternidad(): Promise<ResumenMaternidad> {
  const res = await fetch(
    `${API_BASE}/maternidad/reportes/resumen?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener resumen de maternidad");
  }
  const data = await res.json();
  return data as ResumenMaternidad;
}

export async function exportarMaternidadJSON(): Promise<string> {
  const res = await fetch(
    `${API_BASE}/maternidad/reportes/exportar-json?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al exportar resumen de maternidad");
  }
  // el backend ya devuelve JSON, pero lo convertimos a string legible
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}
