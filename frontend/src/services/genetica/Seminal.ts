// src/services/genetica/Seminal.ts
import API_BASE from "../../config/api";

export type RegistroSeminal = {
  id: number;
  fecha: string;
  identificacion: string;
  raza: string;
  volumen: number;
  concentracion: number;
  motilidad: string;
  calidad: "Excelente" | "Buena" | "Regular" | "Deficiente";
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroSeminal = Omit<RegistroSeminal, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToSeminal(api: any): RegistroSeminal {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacion: api.identificacion,
    raza: api.raza,
    volumen: api.volumen,
    concentracion: api.concentracion,
    motilidad: api.motilidad,
    calidad: api.calidad,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getRegistrosSeminales(): Promise<RegistroSeminal[]> {
  const res = await fetch(
    `${API_BASE}/genetica/seminal/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener registros seminales");
  }
  const data = await res.json();
  return data.map(mapApiToSeminal);
}

export async function addRegistroSeminal(
  reg: NuevoRegistroSeminal
): Promise<RegistroSeminal> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/genetica/seminal/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar muestra seminal");
  }
  const data = await res.json();
  return mapApiToSeminal(data);
}

export async function updateRegistroSeminal(
  id: number,
  reg: NuevoRegistroSeminal
): Promise<RegistroSeminal> {
  const payload = { ...reg };

  const res = await fetch(
    `${API_BASE}/genetica/seminal/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar muestra seminal");
  }
  const data = await res.json();
  return mapApiToSeminal(data);
}

export async function deleteRegistroSeminal(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/genetica/seminal/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar muestra seminal");
  }
}
