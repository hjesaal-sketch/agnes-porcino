// frontend/src/services/Estadisticas.ts
import API_BASE from "../config/api";

export type EstadoIndicador = "Bueno" | "Atención" | "Crítico";

export type IndicadorEstadistica = {
  id: number;
  empresa_id: number;
  granja_id: number;
  nombre: string;
  valor: string;
  unidad: string | null;
  objetivo: string;
  estado: EstadoIndicador;
  categoria: string;
};

export type ResumenMensual = {
  id: number;
  empresa_id: number;
  granja_id: number;
  mes: string;
  partos: number;
  lechones_destetados: number;
  mortalidad_total: number;
};

export type ResumenGlobal = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo_meses: number;
  total_partos: number;
  total_destetados: number;
  mortalidad_promedio: string;
};

export type ChartDataMensual = {
  mes: string;
  partos: number;
  lechonesDestetados: number;
  mortalidadTotal: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): IndicadorEstadistica {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    nombre: api.nombre,
    valor: api.valor,
    unidad: api.unidad ?? null,
    objetivo: api.objetivo,
    estado: api.estado,
    categoria: api.categoria,
  };
}

function mapApiToResumenMensual(api: any): ResumenMensual {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    mes: api.mes,
    partos: api.partos,
    lechones_destetados: api.lechones_destetados,
    mortalidad_total: api.mortalidad_total,
  };
}

function mapApiToResumenGlobal(api: any): ResumenGlobal {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo_meses: api.periodo_meses,
    total_partos: api.total_partos,
    total_destetados: api.total_destetados,
    mortalidad_promedio: api.mortalidad_promedio,
  };
}

export function transformToChartData(
  resumen: ResumenMensual[]
): ChartDataMensual[] {
  return resumen.map((r) => ({
    mes: r.mes,
    partos: r.partos,
    lechonesDestetados: r.lechones_destetados,
    mortalidadTotal: r.mortalidad_total,
  }));
}

export async function getIndicadores(
  categoria?: string
): Promise<IndicadorEstadistica[]> {
  const url = new URL(
    `${API_BASE}/estadisticas/indicadores`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (categoria) {
    url.searchParams.set("categoria", categoria);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener indicadores de estadísticas");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function getResumenMensual(): Promise<ResumenMensual[]> {
  const url = new URL(
    `${API_BASE}/estadisticas/resumen-mensual`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener resumen mensual");
  }
  const data = await res.json();
  return data.map(mapApiToResumenMensual);
}

export async function getResumenGlobal(): Promise<ResumenGlobal> {
  const url = new URL(
    `${API_BASE}/estadisticas/resumen-global`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener resumen global");
  }
  const data = await res.json();
  return mapApiToResumenGlobal(data);
}

export async function addIndicador(
  payload: Omit<
    IndicadorEstadistica,
    "id" | "empresa_id" | "granja_id" | "created_at" | "updated_at"
  >
): Promise<IndicadorEstadistica> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/estadisticas/indicadores`, {
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

export async function addResumenMensual(
  payload: Omit<
    ResumenMensual,
    "id" | "empresa_id" | "granja_id" | "created_at" | "updated_at"
  >
): Promise<ResumenMensual> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/estadisticas/resumen-mensual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al crear resumen mensual");
  }
  const data = await res.json();
  return mapApiToResumenMensual(data);
}
