// src/services/sitio3/Corrales.ts
import API_BASE from "../../config/api";

export type Corral3 = {
  id: number;
  codigo: string;
  tipo: "Engorde" | "Aislamiento" | "Cuarentena";
  capacidad: number;
  ocupacion_actual: number;
  responsable: string;
  observaciones: string;
};

export type NuevoCorral3 = Omit<Corral3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCorral3(api: any): Corral3 {
  return {
    id: api.id,
    codigo: api.codigo,
    tipo: api.tipo,
    capacidad: api.capacidad,
    ocupacion_actual: api.ocupacion_actual,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getCorralesSitio3(): Promise<Corral3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/corrales/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener corrales Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToCorral3);
}

export async function addCorralSitio3(
  corral: NuevoCorral3
): Promise<Corral3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...corral,
  };

  const res = await fetch(`${API_BASE}/sitio3/corrales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar corral Sitio 3");
  }
  const data = await res.json();
  return mapApiToCorral3(data);
}

export async function updateCorralSitio3(
  id: number,
  corral: NuevoCorral3
): Promise<Corral3> {
  const res = await fetch(
    `${API_BASE}/sitio3/corrales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corral),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar corral Sitio 3");
  }
  const data = await res.json();
  return mapApiToCorral3(data);
}

export async function deleteCorralSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/corrales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar corral Sitio 3");
  }
}
