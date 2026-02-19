// src/services/economico/Reportes.ts
import API_BASE from "../../config/api";
import { IngresoEconomico } from "./Ingresos";
import { EgresoEconomico } from "./Egresos";
import { CostoEconomico } from "./Costos";
import { ImpuestoEconomico } from "./Impuestos";

export type ResumenEconomico = {
  ingresos: IngresoEconomico[];
  egresos: EgresoEconomico[];
  costos: CostoEconomico[];
  impuestos: ImpuestoEconomico[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function obtenerResumenEconomico(): Promise<ResumenEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/reportes/resumen?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener resumen económico");
  }
  return res.json();
}

export async function exportarEconomicoJSON(): Promise<string> {
  const res = await fetch(
    `${API_BASE}/economico/reportes/exportar?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al exportar datos económicos");
  }
  return res.text();
}
