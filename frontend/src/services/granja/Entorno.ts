// src/services/granja/Entorno.ts
import API_BASE from "../../config/api";

export type EventoEntorno = {
  id: number;
  fecha: string;
  tipo: "Comunitario" | "Ambiental" | "Geográfico" | "Contexto legal" | "Otro";
  descripcion: string;
  actores: string;
  impacto: "Positivo" | "Negativo" | "Neutro";
  observaciones: string;
};

export type NuevoEventoEntorno = Omit<EventoEntorno, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEvento(api: any): EventoEntorno {
  return {
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    descripcion: api.descripcion,
    actores: api.actores,
    impacto: api.impacto,
    observaciones: api.observaciones ?? "",
  };
}

export async function getEventosEntorno(): Promise<EventoEntorno[]> {
  const res = await fetch(
    `${API_BASE}/granja/entorno/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener eventos de entorno");
  }
  const data = await res.json();
  return data.map(mapApiToEvento);
}

export async function addEventoEntorno(
  evento: NuevoEventoEntorno
): Promise<EventoEntorno> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: evento.fecha,
    tipo: evento.tipo,
    descripcion: evento.descripcion,
    actores: evento.actores,
    impacto: evento.impacto,
    observaciones: evento.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/entorno/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar evento de entorno");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function updateEventoEntorno(
  id: number,
  evento: NuevoEventoEntorno
): Promise<EventoEntorno> {
  const payload = {
    fecha: evento.fecha,
    tipo: evento.tipo,
    descripcion: evento.descripcion,
    actores: evento.actores,
    impacto: evento.impacto,
    observaciones: evento.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/entorno/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar evento de entorno");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function deleteEventoEntorno(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/entorno/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar evento de entorno");
  }
}
