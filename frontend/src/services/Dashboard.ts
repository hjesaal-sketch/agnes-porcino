//frontend/src/services/Dashboard.ts
import API_BASE from "../config/api";
import { getAuthHeaders } from "./api";

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
  fecha: string;
  partos: number;
  nacidos: number;
  fallos: number;
  mortalidad: number;
  destetes: number;
};

function getEmpresaId(): number {
  const empresaIdGuardado = localStorage.getItem("empresa_id");

  if (!empresaIdGuardado) {
    throw new Error(
      "No se encontró la empresa del usuario actual. Debes iniciar sesión nuevamente."
    );
  }

  const empresa_id = Number(empresaIdGuardado);

  if (Number.isNaN(empresa_id)) {
    throw new Error(
      "El identificador de empresa es inválido. Debes iniciar sesión nuevamente."
    );
  }

  return empresa_id;
}

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
    fecha: api.fecha ?? api.mes ?? "",
    partos: api.partos ?? 0,
    nacidos: api.nacidos ?? api.destetes ?? 0,
    fallos: api.fallos ?? 0,
    mortalidad: api.mortalidad ?? 0,
    destetes: api.destetes ?? 0,
  };
}

export async function getIndicadores(): Promise<IndicadorStats> {
  const empresa_id = getEmpresaId();

  const baseUrl = API_BASE || window.location.origin;
  const url = new URL(`/dashboard/indicadores`, baseUrl);
  url.searchParams.set("empresa_id", String(empresa_id));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener indicadores");
  }

  const data = await res.json();
  return mapApiToIndicador(data);
}

export async function getEventosTareas(
  completado: boolean = false
): Promise<EventoTarea[]> {
  const empresa_id = getEmpresaId();

  const baseUrl = API_BASE || window.location.origin;
  const url = new URL(`/dashboard/eventos-tareas`, baseUrl);
  url.searchParams.set("empresa_id", String(empresa_id));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  url.searchParams.set("completado", String(completado));

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener eventos");
  }

  const data = await res.json();
  return data.map(mapApiToEvento);
}

export async function getResumenReproductivo(): Promise<ResumenReproductivo[]> {
  const empresa_id = getEmpresaId();

  const baseUrl = API_BASE || window.location.origin;
  const url = new URL(`/dashboard/resumen-reproductivo`, baseUrl);
  url.searchParams.set("empresa_id", String(empresa_id));
  url.searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener resumen reproductivo");
  }

  const data = await res.json();
  return data.map(mapApiToResumen);
}

export async function actualizarIndicadores(
  payload: Omit<IndicadorStats, "id" | "empresa_id" | "granja_id">
): Promise<IndicadorStats> {
  const empresa_id = getEmpresaId();

  const body = {
    empresa_id,
    granja_id: GRANJA_ID,
    ...payload,
  };

  const baseUrl = API_BASE || window.location.origin;
  const res = await fetch(`${baseUrl}/dashboard/indicadores`, {
    method: "POST",
    headers: getAuthHeaders(),
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
  const empresa_id = getEmpresaId();

  const body = {
    empresa_id,
    granja_id: GRANJA_ID,
    ...payload,
  };

  const baseUrl = API_BASE || window.location.origin;
  const res = await fetch(`${baseUrl}/dashboard/eventos-tareas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Error al crear evento");
  }

  const data = await res.json();
  return mapApiToEvento(data);
}

export async function marcarEventoCompletado(id: number): Promise<EventoTarea> {
  const baseUrl = API_BASE || window.location.origin;
  const res = await fetch(
    `${baseUrl}/dashboard/eventos-tareas/${id}/completar`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Error al completar evento");
  }

  const data = await res.json();
  return mapApiToEvento(data);
}

export async function crearResumenReproductivo(
  payload: Omit<ResumenReproductivo, "id" | "empresa_id" | "granja_id">
): Promise<ResumenReproductivo> {
  const empresa_id = getEmpresaId();

  const body = {
    empresa_id,
    granja_id: GRANJA_ID,
    ...payload,
  };

  const baseUrl = API_BASE || window.location.origin;
  const res = await fetch(`${baseUrl}/dashboard/resumen-reproductivo`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Error al crear resumen reproductivo");
  }

  const data = await res.json();
  return mapApiToResumen(data);
}