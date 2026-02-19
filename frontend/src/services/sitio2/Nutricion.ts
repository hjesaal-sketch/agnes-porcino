// src/services/sitio2/Nutricion.ts
import API_BASE from "../../config/api";

export type RegistroNutricion = {
  id: number;
  fecha: string;
  corral: string;
  dieta: string;
  alimento_consumido: number;
  suplemento: string;
  cantidad_suplemento: number;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroNutricion = Omit<RegistroNutricion, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToNutricion(api: any): RegistroNutricion {
  return {
    id: api.id,
    fecha: api.fecha,
    corral: api.corral,
    dieta: api.dieta,
    alimento_consumido: api.alimento_consumido,
    suplemento: api.suplemento,
    cantidad_suplemento: api.cantidad_suplemento,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getNutricionSitio2(): Promise<RegistroNutricion[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/nutricion/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener registros nutricionales");
  }
  const data = await res.json();
  return data.map(mapApiToNutricion);
}

export async function addNutricionSitio2(
  reg: NuevoRegistroNutricion
): Promise<RegistroNutricion> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio2/nutricion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar consumo nutricional");
  }
  const data = await res.json();
  return mapApiToNutricion(data);
}

export async function updateNutricionSitio2(
  id: number,
  reg: NuevoRegistroNutricion
): Promise<RegistroNutricion> {
  const res = await fetch(
    `${API_BASE}/sitio2/nutricion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar registro nutricional");
  }
  const data = await res.json();
  return mapApiToNutricion(data);
}

export async function deleteNutricionSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/nutricion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar registro nutricional");
  }
}
