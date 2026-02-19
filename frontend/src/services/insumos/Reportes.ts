// src/services/insumos/Reportes.ts
import API_BASE from "../../config/api";
import { Medicamento } from "./Medicamentos";
import { ProductoLimpieza } from "./Limpieza";
import { Alimento } from "./Alimentos";
import { InsumoGeneral } from "./Generales";
import { Equipo } from "./Equipos";
import { CostoInsumo } from "./Costos";

export type ResumenInsumos = {
  generated_at: string;
  empresa_id: number;
  granja_id: number;
  medicamentos: Medicamento[];
  limpieza: ProductoLimpieza[];
  alimentos: Alimento[];
  generales: InsumoGeneral[];
  equipos: Equipo[];
  costos: CostoInsumo[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function obtenerResumenInsumos(): Promise<ResumenInsumos> {
  const res = await fetch(
    `${API_BASE}/insumos/reportes/resumen?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener resumen de insumos");
  }
  return res.json();
}

export async function exportarInsumosJSON(): Promise<string> {
  const resumen = await obtenerResumenInsumos();
  return JSON.stringify(resumen, null, 2);
}
