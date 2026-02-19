// src/services/gestacion/Alertas.ts

import API_BASE from "../../config/api";

export type AlertaGestacion = {
  id: number;
  fecha: string;
  tipo: "Sanitaria" | "Reproductiva" | "Bioseguridad" | "Vencimiento" | "Otro";
  nivel: "Crítico" | "Advertencia" | "Informativo";
  descripcion: string;
  responsable: string;
  estado: "Abierta" | "Cerrada";
  acciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

// Adaptar la respuesta cruda de la API a tu tipo de front
function mapApiToAlerta(api: any): AlertaGestacion {
  return {
    id: api.id,
    fecha: api.fecha_objetivo ?? api.created_at ?? "",
    // El backend maneja `tipo` libre. Aquí puedes mapearlo a tus categorías de front si quieres.
    tipo: "Reproductiva",
    nivel: "Informativo",
    descripcion: api.mensaje,
    responsable: "",
    estado: api.leida ? "Cerrada" : "Abierta",
    acciones: api.detalle ?? "",
  };
}

// LISTAR
export async function getAlertas(): Promise<AlertaGestacion[]> {
  const res = await fetch(
    `${API_BASE}/gestacion/alertas?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener alertas");
  const data = await res.json();
  return (data as any[]).map(mapApiToAlerta);
}

// CREAR
export async function addAlerta(
  alerta: Omit<AlertaGestacion, "id">
): Promise<AlertaGestacion> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    // En el backend `tipo` es un string genérico; aquí dejamos un valor fijo por ahora.
    tipo: "RECORDATORIO",
    mensaje: alerta.descripcion,
    fecha_objetivo: alerta.fecha || null,
    leida: alerta.estado === "Cerrada",
    sow_id: null,
    servicio_id: null,
    parto_programado_id: null,
  };

  const res = await fetch(`${API_BASE}/gestacion/alertas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear alerta");
  const data = await res.json();
  return mapApiToAlerta(data);
}

// ACTUALIZAR
export async function updateAlerta(
  id: number,
  alerta: Omit<AlertaGestacion, "id">
): Promise<AlertaGestacion> {
  const payload = {
    mensaje: alerta.descripcion,
    fecha_objetivo: alerta.fecha || null,
    leida: alerta.estado === "Cerrada",
  };

  const res = await fetch(
    `${API_BASE}/gestacion/alertas/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar alerta");
  const data = await res.json();
  return mapApiToAlerta(data);
}

// ELIMINAR
export async function deleteAlerta(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/gestacion/alertas/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar alerta");
}
