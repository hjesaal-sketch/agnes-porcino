// src/services/sitio2/Corrales.ts
import API_BASE from "../../config/api";

export type Corral = {
  id: number;
  codigo: string;
  tipo: "Engorde" | "Recría" | "Cuarentena";
  capacidad: number;
  ocupacion_actual: number;
  responsable: string;
  observaciones: string;
};

export type NuevoCorral = Omit<Corral, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCorral(api: any): Corral {
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

export async function getCorralesSitio2(): Promise<Corral[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/corrales/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener corrales");
  }
  const data = await res.json();
  return data.map(mapApiToCorral);
}

export async function addCorralSitio2(
  corral: NuevoCorral
): Promise<Corral> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...corral,
  };

  const res = await fetch(`${API_BASE}/sitio2/corrales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar corral");
  }
  const data = await res.json();
  return mapApiToCorral(data);
}

export async function updateCorralSitio2(
  id: number,
  corral: NuevoCorral
): Promise<Corral> {
  const res = await fetch(
    `${API_BASE}/sitio2/corrales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corral),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar corral");
  }
  const data = await res.json();
  return mapApiToCorral(data);
}

export async function deleteCorralSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/corrales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar corral");
  }
}
