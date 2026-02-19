// src/services/sitio2/Mortalidad.ts
import API_BASE from "../../config/api";

export type RegistroMortalidad = {
  id: number;
  fecha: string;
  lote: string;
  corral: string;
  cantidad: number;
  causa: string;
  tipo: "Mortalidad" | "Descarte";
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroMortalidad = Omit<RegistroMortalidad, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToMortalidad(api: any): RegistroMortalidad {
  return {
    id: api.id,
    fecha: api.fecha,
    lote: api.lote,
    corral: api.corral,
    cantidad: api.cantidad,
    causa: api.causa,
    tipo: api.tipo,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getMortalidadSitio2(): Promise<RegistroMortalidad[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/mortalidad/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener mortalidad y descartes");
  }
  const data = await res.json();
  return data.map(mapApiToMortalidad);
}

export async function addMortalidadSitio2(
  reg: NuevoRegistroMortalidad
): Promise<RegistroMortalidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio2/mortalidad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar baja/descarte");
  }
  const data = await res.json();
  return mapApiToMortalidad(data);
}

export async function updateMortalidadSitio2(
  id: number,
  reg: NuevoRegistroMortalidad
): Promise<RegistroMortalidad> {
  const res = await fetch(
    `${API_BASE}/sitio2/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar baja/descarte");
  }
  const data = await res.json();
  return mapApiToMortalidad(data);
}

export async function deleteMortalidadSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar baja/descarte");
  }
}
