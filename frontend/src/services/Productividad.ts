// frontend/src/services/Productividad.ts
import API_BASE from "../config/api";

export type EstadoIndicador = "Bueno" | "Atención" | "Crítico";

export type IndicadorProd = {
  id: number;
  empresa_id: number;
  granja_id: number;
  nombre: string;
  valor: string;
  unidad: string | null;
  objetivo: string;
  estado: EstadoIndicador;
};

export type HistRow = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  sitio: string;
  animales_ingresados: number;
  animales_salidos: number;
  kilos_vendidos: number;
  mortalidad: number;
  fcr: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): IndicadorProd {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    nombre: api.nombre,
    valor: api.valor,
    unidad: api.unidad ?? null,
    objetivo: api.objetivo,
    estado: api.estado,
  };
}

function mapApiToHistoria(api: any): HistRow {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    sitio: api.sitio,
    animales_ingresados: api.animales_ingresados,
    animales_salidos: api.animales_salidos,
    kilos_vendidos: api.kilos_vendidos,
    mortalidad: api.mortalidad,
    fcr: api.fcr,
  };
}

export async function getIndicadores(): Promise<IndicadorProd[]> {
  const url = new URL(`${API_BASE}/productividad/indicadores`, window.location.origin);
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener indicadores");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function getHistorial(): Promise<HistRow[]> {
  const url = new URL(`${API_BASE}/productividad/historial`, window.location.origin);
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener historial");
  }
  const data = await res.json();
  return data.map(mapApiToHistoria);
}

export async function addIndicador(
  payload: Omit<IndicadorProd, "id" | "empresa_id" | "granja_id" | "created_at" | "updated_at">
): Promise<IndicadorProd> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/productividad/indicadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al crear indicador");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}

export async function addHistorial(
  payload: Omit<HistRow, "id" | "empresa_id" | "granja_id" | "created_at" | "updated_at">
): Promise<HistRow> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/productividad/historial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al crear historial");
  }
  const data = await res.json();
  return mapApiToHistoria(data);
}
