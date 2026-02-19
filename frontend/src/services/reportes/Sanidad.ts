// frontend/src/services/reportes/Sanidad.ts
import API_BASE from "../../config/api";

export type EventoSanidad = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  eventos: number;
  baja_enf: number;
  tratamientos: number;
  vacunaciones: number;
  responsable: string;
};

export type NuevoEventoSanidad = Omit<
  EventoSanidad,
  "id" | "fecha_inicio" | "fecha_fin"
> & {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEvento(api: any): EventoSanidad {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    fecha_inicio: api.fecha_inicio ?? null,
    fecha_fin: api.fecha_fin ?? null,
    eventos: api.eventos,
    baja_enf: api.baja_enf,
    tratamientos: api.tratamientos,
    vacunaciones: api.vacunaciones,
    responsable: api.responsable,
  };
}

export async function getSanidad(
  periodo?: string
): Promise<EventoSanidad[]> {
  const url = new URL(
    `${API_BASE}/reportes/sanidad/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (periodo) {
    url.searchParams.set("periodo", periodo);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener reporte sanitario");
  }
  const data = await res.json();
  return data.map(mapApiToEvento);
}

export async function addSanidad(
  payload: Omit<NuevoEventoSanidad, "empresa_id" | "granja_id">
): Promise<EventoSanidad> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/sanidad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar indicador sanitario");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}
