// src/services/sitio2/SaludBienestar.ts
import API_BASE from "../../config/api";

export type RegistroSalud = {
  id: number;
  fecha: string;
  corral: string;
  lote: string;
  evento: string;
  tratamiento: string;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroSalud = Omit<RegistroSalud, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToSalud(api: any): RegistroSalud {
  return {
    id: api.id,
    fecha: api.fecha,
    corral: api.corral,
    lote: api.lote,
    evento: api.evento,
    tratamiento: api.tratamiento,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getSaludSitio2(): Promise<RegistroSalud[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/salud-bienestar/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener eventos de salud/bienestar");
  }
  const data = await res.json();
  return data.map(mapApiToSalud);
}

export async function addSaludSitio2(
  reg: NuevoRegistroSalud
): Promise<RegistroSalud> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio2/salud-bienestar/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar evento");
  }
  const data = await res.json();
  return mapApiToSalud(data);
}

export async function updateSaludSitio2(
  id: number,
  reg: NuevoRegistroSalud
): Promise<RegistroSalud> {
  const res = await fetch(
    `${API_BASE}/sitio2/salud-bienestar/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar evento");
  }
  const data = await res.json();
  return mapApiToSalud(data);
}

export async function deleteSaludSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/salud-bienestar/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar evento");
  }
}
