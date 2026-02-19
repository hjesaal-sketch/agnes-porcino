// frontend/src/services/Dashboard.ts
import API_BASE from "../config/api";

export type IndicadorStats = {
  id: number;
  empresa_id: number;
  granja_id: number;
  proximos_partos: number;
  fallos_reproductivos: number;
  mortalidad: number;
  alimento_bajo: number;
  medicamento_bajo: number;
  celos_recientes: number;
  listos_destete: number;
};

export type EventoTarea = {
  id: number;
  empresa_id: number;
  granja_id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  fecha_evento: string;
  completado: boolean;
};

export type ResumenReproductivo = {
  id: number;
  empresa_id: number;
  granja_id: number;
  mes: string;
  partos: number;
  fallos: number;
  mortalidad: number;
  destetes: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): IndicadorStats {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    proximos_partos: api.proximos_partos,
    fallos_reproductivos: api.fallos_reproductivos,
    mortalidad: api.mortalidad,
    alimento_bajo: api.alimento_bajo,
    medicamento_bajo: api.medicamento_bajo,
    celos_recientes: api.celos_recientes,
    listos_destete: api.listos_destete,
  };
}

function mapApiToEvento(api: any): EventoTarea {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    tipo: api.tipo,
    descripcion: api.descripcion,
    cantidad: api.cantidad,
    fecha_evento: api.fecha_evento,
    completado: api.completado,
  };
}

function mapApiToResumen(api: any): ResumenReproductivo {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    mes: api.mes,
    partos: api.partos,
    fallos: api.fallos,
    mortalidad: api.mortalidad,
    destetes: api.destetes,
  };
}

export async function getIndicadores(): Promise<IndicadorStats> {
  const url = new URL(`${API_BASE}/dashboard/indicadores`, window.location.origin);
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener indicadores");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}

export async function getEventosTareas(
  completado: boolean = false
): Promise<EventoTarea[]> {
  const url = new URL(
    `${API_BASE}/dashboard/eventos-tareas`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  url.searchParams.set("completado", String(completado));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener eventos");
  }
  const data = await res.json();
  return data.map(mapApiToEvento);
}

export async function getResumenReproductivo(): Promise<ResumenReproductivo[]> {
  const url = new URL(
    `${API_BASE}/dashboard/resumen-reproductivo`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener resumen reproductivo");
  }
  const data = await res.json();
  return data.map(mapApiToResumen);
}

export async function actualizarIndicadores(
  payload: Omit<IndicadorStats, "id" | "empresa_id" | "granja_id">
): Promise<IndicadorStats> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/dashboard/indicadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al actualizar indicadores");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}

export async function crearEvento(
  payload: Omit<EventoTarea, "id" | "empresa_id" | "granja_id">
): Promise<EventoTarea> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/dashboard/eventos-tareas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al crear evento");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function marcarEventoCompletado(id: number): Promise<EventoTarea> {
  const res = await fetch(`${API_BASE}/dashboard/eventos-tareas/${id}/completar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Error al completar evento");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function crearResumenReproductivo(
  payload: Omit<ResumenReproductivo, "id" | "empresa_id" | "granja_id">
): Promise<ResumenReproductivo> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/dashboard/resumen-reproductivo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al crear resumen reproductivo");
  }
  const data = await res.json();
  return mapApiToResumen(data);
}
