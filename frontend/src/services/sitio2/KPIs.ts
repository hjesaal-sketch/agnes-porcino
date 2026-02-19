// src/services/sitio2/KPIs.ts
import API_BASE from "../../config/api";

export type Sitio2IngresoItem = {
  fecha: string;
  lote: string;
  cantidad: number;
  peso_promedio: number;
};

export type RegistroCrecimiento = {
  fecha: string;
  lote: string;
  corral: string;
  cantidad_pesada: number;
  peso_promedio: number;
};

export type RegistroNutricion = {
  fecha: string;
  corral: string;
  lote: string;
  alimento_consumido: number;
};

export type RegistroMortalidad = {
  fecha: string;
  lote: string;
  cantidad: number;
};

export type RegistroVenta = {
  fecha: string;
  lote: string;
  cantidad_vendida: number;
  peso_promedio_venta: number;
};

export type Sitio2KpiInput = {
  ingresos: Sitio2IngresoItem[];
  crecimientos: RegistroCrecimiento[];
  nutricion: RegistroNutricion[];
  mortalidad: RegistroMortalidad[];
  ventas: RegistroVenta[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function getSitio2KpiInput(): Promise<Sitio2KpiInput> {
  const res = await fetch(
    `${API_BASE}/sitio2/kpis/input?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener datos base para KPIs Sitio 2");
  }
  return res.json();
}
