// src/services/granja/Bioseguridad.ts
import API_BASE from "../../config/api";

export type EventoBioseguridad = {
  id: number;
  fecha: string;
  tipo:
    | "Ingreso personas"
    | "Mov. animales"
    | "Desinfección"
    | "Contingencia"
    | "Auditoría"
    | "Otro";
  descripcion: string;
  responsable: string;
  acciones: string;
  estado: "Resuelto" | "Pendiente" | "Crítico";
  observaciones: string;
};

export type NuevoEventoBioseguridad = Omit<EventoBioseguridad, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEvento(api: any): EventoBioseguridad {
  return {
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    descripcion: api.descripcion,
    responsable: api.responsable,
    acciones: api.acciones ?? "",
    estado: api.estado,
    observaciones: api.observaciones ?? "",
  };
}

export async function getEventosBioseguridad(): Promise<EventoBioseguridad[]> {
  const res = await fetch(
    `${API_BASE}/granja/bioseguridad/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener eventos de bioseguridad");
  }
  const data = await res.json();
  return data.map(mapApiToEvento);
}

export async function addEventoBioseguridad(
  evento: NuevoEventoBioseguridad
): Promise<EventoBioseguridad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: evento.fecha,
    tipo: evento.tipo,
    descripcion: evento.descripcion,
    responsable: evento.responsable,
    acciones: evento.acciones,
    estado: evento.estado,
    observaciones: evento.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/bioseguridad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar evento de bioseguridad");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function updateEventoBioseguridad(
  id: number,
  evento: NuevoEventoBioseguridad
): Promise<EventoBioseguridad> {
  const payload = {
    fecha: evento.fecha,
    tipo: evento.tipo,
    descripcion: evento.descripcion,
    responsable: evento.responsable,
    acciones: evento.acciones,
    estado: evento.estado,
    observaciones: evento.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/bioseguridad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar evento de bioseguridad");
  }
  const data = await res.json();
  return mapApiToEvento(data);
}

export async function deleteEventoBioseguridad(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/bioseguridad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar evento de bioseguridad");
  }
}
