// src/services/genetica/Valoracion.ts
import API_BASE from "../../config/api";

export type ValoracionGenetica = {
  id: number;
  fecha: string;
  identificacion: string;
  raza: string;
  resultado: string;
  prueba: "Indice Genético" | "Test ADN" | "Morfología" | "Sanidad" | "Otro";
  evaluador: string;
  score: number;
  observaciones: string;
};

export type NuevaValoracionGenetica = Omit<ValoracionGenetica, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToValoracion(api: any): ValoracionGenetica {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacion: api.identificacion,
    raza: api.raza,
    resultado: api.resultado,
    prueba: api.prueba,
    evaluador: api.evaluador,
    score: api.score,
    observaciones: api.observaciones ?? "",
  };
}

export async function getValoraciones(): Promise<ValoracionGenetica[]> {
  const res = await fetch(
    `${API_BASE}/genetica/valoraciones/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener valoraciones genéticas");
  }
  const data = await res.json();
  return data.map(mapApiToValoracion);
}

export async function addValoracion(
  v: NuevaValoracionGenetica
): Promise<ValoracionGenetica> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...v,
  };

  const res = await fetch(`${API_BASE}/genetica/valoraciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar valoración genética");
  }
  const data = await res.json();
  return mapApiToValoracion(data);
}

export async function updateValoracion(
  id: number,
  v: NuevaValoracionGenetica
): Promise<ValoracionGenetica> {
  const payload = { ...v };

  const res = await fetch(
    `${API_BASE}/genetica/valoraciones/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar valoración genética");
  }
  const data = await res.json();
  return mapApiToValoracion(data);
}

export async function deleteValoracion(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/genetica/valoraciones/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar valoración genética");
  }
}
