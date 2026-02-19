// src/services/gestacion/Madres.ts

import API_BASE from "../../config/api";

export type EstadoMadre =
  | "Gestante"
  | "Vacía"
  | "Parida"
  | "Reemplazo"
  | "Aborto"
  | "Baja";

export type MadreGestante = {
  id: number; // viene de la BD
  fechaIngreso: string;
  identificacion: string;
  raza: string;
  fechaNacimiento: string; // persistente
  edadMeses: number;
  lote: string;
  estado: EstadoMadre;
  observaciones: string;
  paridad: number;
  causa_baja?: string | null;
};

const GRANJA_ID = 1;

// Adaptar desde el modelo del backend (MadreRead) a tu tipo de front
function mapApiToMadre(api: any): MadreGestante {
  let estadoFront: EstadoMadre;

  const estadoApi = (api.estado_actual || "").trim();

  // Soportar valores históricos y nuevos
  if (estadoApi === "Gestación" || estadoApi === "Gestante") {
    estadoFront = "Gestante";
  } else if (estadoApi === "Vacía") {
    estadoFront = "Vacía";
  } else if (estadoApi === "Reemplazo") {
    estadoFront = "Reemplazo";
  } else if (estadoApi === "Aborto") {
    estadoFront = "Aborto";
  } else if (estadoApi === "Baja") {
    estadoFront = "Baja";
  } else {
    estadoFront = "Parida";
  }

  return {
    id: api.id,
    // el backend ya manda fechaIngreso; si no, cae a fecha_alta
    fechaIngreso: api.fechaIngreso ?? api.fecha_alta ?? "",
    identificacion: api.identificacion,
    raza: api.raza ?? "",
    // idem con fechaNacimiento
    fechaNacimiento: api.fechaNacimiento ?? api.fecha_nacimiento ?? "",
    // idem con edadMeses
    edadMeses: api.edadMeses ?? api.edad_meses ?? 0,
    lote: api.lote ?? "",
    estado: estadoFront,
    observaciones: api.observaciones ?? "",
    paridad: api.paridad ?? 0,
    causa_baja: api.causa_baja ?? null,
  };
}

export async function getMadres(): Promise<MadreGestante[]> {
  const res = await fetch(
    `${API_BASE}/gestacion/madres?granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener madres");
  const data = await res.json();
  return data.map(mapApiToMadre);
}

function mapEstadoFrontToApi(estado: EstadoMadre): string {
  if (estado === "Gestante") return "Gestante"; // estándar nuevo
  if (estado === "Vacía") return "Vacía";
  if (estado === "Reemplazo") return "Reemplazo";
  if (estado === "Aborto") return "Aborto";
  if (estado === "Baja") return "Baja";
  return "Parida";
}

export async function addMadre(
  madre: Omit<MadreGestante, "id" | "causa_baja">
): Promise<MadreGestante> {
  const payload = {
    identificacion: madre.identificacion,
    granja_id: GRANJA_ID,
    raza: madre.raza,
    lote: madre.lote,
    // el backend ahora espera camelCase en Pydantic
    fechaIngreso: madre.fechaIngreso,
    fechaNacimiento: madre.fechaNacimiento || null,
    edadMeses: madre.edadMeses,
    observaciones: madre.observaciones,
    paridad: madre.paridad ?? 0,
    estado_actual: mapEstadoFrontToApi(madre.estado),
    activo: true,
  };

  const res = await fetch(`${API_BASE}/gestacion/madres`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Error al crear madre");
  const data = await res.json();
  return mapApiToMadre(data);
}

export async function updateMadre(
  id: number,
  madre: Omit<MadreGestante, "id">
): Promise<MadreGestante> {
  const payload = {
    raza: madre.raza,
    lote: madre.lote,
    fechaNacimiento: madre.fechaNacimiento || null,
    edadMeses: madre.edadMeses,
    observaciones: madre.observaciones,
    paridad: madre.paridad ?? 0,
    estado_actual: mapEstadoFrontToApi(madre.estado),
    activo: true,
    causa_baja: madre.causa_baja ?? null,
  };

  const res = await fetch(
    `${API_BASE}/gestacion/madres/${id}?granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Error al actualizar madre");
  const data = await res.json();
  return mapApiToMadre(data);
}

export async function darBajaMadre(
  id: number,
  causa_baja: string
): Promise<MadreGestante> {
  const payload = { causa_baja };

  const res = await fetch(
    `${API_BASE}/gestacion/madres/${id}/baja?granja_id=${GRANJA_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error al dar de baja madre");
  }

  const data = await res.json();
  return mapApiToMadre(data);
}

export async function deleteMadre(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/gestacion/madres/${id}?granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar madre");
}
