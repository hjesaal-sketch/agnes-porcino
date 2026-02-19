// src/services/Alertas.ts
import API_BASE from "../../config/api";

export type AlertaMaternidad = {
  id: number;
  fecha: string;
  tipo: "Sanitaria" | "Nutricional" | "Reproductiva" | "Manejo" | "Otro";
  nivel: "Crítico" | "Advertencia" | "Informativo";
  descripcion: string;
  responsable: string;
  estado: "Abierta" | "Cerrada";
  acciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToAlerta(api: any): AlertaMaternidad {
  return {
    id: api.id,
    fecha: api.fecha ?? "",
    tipo: api.tipo,
    nivel: api.nivel ?? "Crítico",
    descripcion: api.descripcion ?? "",
    responsable: api.responsable ?? "",
    estado: api.estado ?? "Abierta",
    acciones: api.acciones ?? "",
  };
}

export async function getAlertas(): Promise<AlertaMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/alertas/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener alertas de maternidad");
  const data = await res.json();
  return data.map(mapApiToAlerta);
}

export async function addAlerta(
  alerta: Omit<AlertaMaternidad, "id">
): Promise<AlertaMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    tipo: alerta.tipo,
    mensaje: alerta.descripcion, // o lo que decidas mapear
    fecha: alerta.fecha,
    nivel: alerta.nivel,
    descripcion: alerta.descripcion,
    responsable: alerta.responsable,
    estado: alerta.estado,
    acciones: alerta.acciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/alertas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear alerta de maternidad");
  const data = await res.json();
  return mapApiToAlerta(data);
}

export async function updateAlerta(
  id: number,
  alerta: Omit<AlertaMaternidad, "id">
): Promise<AlertaMaternidad> {
  const payload = {
    tipo: alerta.tipo,
    mensaje: alerta.descripcion,
    fecha: alerta.fecha,
    nivel: alerta.nivel,
    descripcion: alerta.descripcion,
    responsable: alerta.responsable,
    estado: alerta.estado,
    acciones: alerta.acciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/alertas/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar alerta de maternidad");
  const data = await res.json();
  return mapApiToAlerta(data);
}

export async function deleteAlerta(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/alertas/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar alerta de maternidad");
}
