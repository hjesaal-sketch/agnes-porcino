// src/services/Mortandad.ts
import API_BASE from "../../config/api";

export type MortalidadMaternidad = {
  id: number;
  fecha: string;
  identificacionMadre: string;
  tipo: "Madre" | "Lechón";
  causa: string;
  cantidad: number;
  responsable: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToMortalidad(api: any): MortalidadMaternidad {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacionMadre: api.identificacionMadre,
    tipo: api.tipo,
    causa: api.causa,
    cantidad: api.cantidad,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getRegistrosMortalidad(): Promise<MortalidadMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/mortalidad/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener registros de mortalidad");
  const data = await res.json();
  return data.map(mapApiToMortalidad);
}

export type NuevaMortalidadMaternidad = Omit<MortalidadMaternidad, "id">;

export async function addMortalidad(
  registro: NuevaMortalidadMaternidad
): Promise<MortalidadMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    tipo: registro.tipo,
    causa: registro.causa,
    cantidad: registro.cantidad,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/mortalidad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar mortalidad");
  const data = await res.json();
  return mapApiToMortalidad(data);
}

export async function updateMortalidad(
  id: number,
  registro: NuevaMortalidadMaternidad
): Promise<MortalidadMaternidad> {
  const payload = {
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    tipo: registro.tipo,
    causa: registro.causa,
    cantidad: registro.cantidad,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar mortalidad");
  const data = await res.json();
  return mapApiToMortalidad(data);
}

export async function deleteMortalidad(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar mortalidad");
}
