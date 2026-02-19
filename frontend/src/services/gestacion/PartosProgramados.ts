// src/services/gestacion/PartosProgramados.ts

import API_BASE from "../../config/api";

export type PartoProgramado = {
  id: number;
  idMadre: string;
  granja_id: number;
  fechaServicio: string;
  fechaProbableParto: string;
  tipoServicio: "Natural" | "Inseminación" | "Transferencia Embrionaria";
  observaciones: string;
  realizado: boolean;          // solo lectura (backend)
  servicio_id: number | null;
};

const GRANJA_ID = 1;

// Mapeo de la respuesta API -> modelo de frontend
function mapApiToParto(api: any): PartoProgramado {
  return {
    id: api.id,
    idMadre: api.idMadre ?? "",
    granja_id: api.granja_id,
    fechaServicio: api.fechaServicio,
    fechaProbableParto: api.fechaProbableParto,
    tipoServicio: api.tipoServicio,
    observaciones: api.observaciones ?? "",
    realizado: api.realizado ?? false,
    servicio_id: api.servicio_id ?? null,
  };
}

export async function getPartos(): Promise<PartoProgramado[]> {
  const res = await fetch(
    `${API_BASE}/gestacion/partos-programados?granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener partos programados");
  const data = await res.json();
  return (data as any[]).map(mapApiToParto);
}

// Para creación/reprogramación manual desde UI
type PartoCreatePayload = {
  idMadre: string;
  fechaServicio: string;
  fechaProbableParto?: string;
  tipoServicio: PartoProgramado["tipoServicio"];
  observaciones: string;
};

export async function addParto(
  p: PartoCreatePayload
): Promise<PartoProgramado> {
  const payload = {
    idMadre: p.idMadre,
    granja_id: GRANJA_ID,
    fechaServicio: p.fechaServicio,
    fechaProbableParto: p.fechaProbableParto || undefined,
    tipoServicio: p.tipoServicio,
    observaciones: p.observaciones,
    // realizado siempre false al programar desde aquí
    realizado: false,
    servicio_id: null,
  };

  const res = await fetch(`${API_BASE}/gestacion/partos-programados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Error al crear parto programado");
  const data = await res.json();
  return mapApiToParto(data);
}

type PartoUpdatePayload = {
  fechaServicio?: string;
  fechaProbableParto?: string;
  tipoServicio?: PartoProgramado["tipoServicio"];
  observaciones?: string;
};

export async function updateParto(
  id: number,
  p: PartoUpdatePayload
): Promise<PartoProgramado> {
  const payload = {
    fechaServicio: p.fechaServicio,
    fechaProbableParto: p.fechaProbableParto,
    tipoServicio: p.tipoServicio,
    observaciones: p.observaciones,
    // realizado y servicio_id no se tocan desde esta pantalla
  };

  const res = await fetch(
    `${API_BASE}/gestacion/partos-programados/${id}?granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Error al actualizar parto programado");
  const data = await res.json();
  return mapApiToParto(data);
}

export async function deleteParto(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/gestacion/partos-programados/${id}?granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar parto programado");
}
