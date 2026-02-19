// src/services/Ingreso.ts
import API_BASE from "../../config/api";

export type IngresoMaternidad = {
  id: number;
  fechaIngreso: string;
  identificacionMadre: string;
  lote: string;
  raza: string;
  ageMeses: number;
  motivoIngreso: "Gestación" | "Parto" | "Observación" | "Otro";
  responsable: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIngreso(api: any): IngresoMaternidad {
  // El modelo Pydantic IngresoRead usa estos nombres en camelCase
  return {
    id: api.id,
    fechaIngreso: api.fechaIngreso,
    identificacionMadre: api.identificacionMadre,
    lote: api.lote ?? "",
    raza: api.raza ?? "",
    ageMeses: api.ageMeses,
    motivoIngreso: api.motivoIngreso,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getIngresos(): Promise<IngresoMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/ingreso/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener ingresos de maternidad");
  const data = await res.json();
  return data.map(mapApiToIngreso);
}

export type NuevoIngresoMaternidad = Omit<IngresoMaternidad, "id">;

export async function addIngreso(
  ingreso: NuevoIngresoMaternidad
): Promise<IngresoMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fechaIngreso: ingreso.fechaIngreso,
    identificacionMadre: ingreso.identificacionMadre,
    lote: ingreso.lote,
    raza: ingreso.raza,
    ageMeses: ingreso.ageMeses,
    motivoIngreso: ingreso.motivoIngreso,
    responsable: ingreso.responsable,
    observaciones: ingreso.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/ingreso/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar ingreso de maternidad");
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function updateIngreso(
  id: number,
  ingreso: NuevoIngresoMaternidad
): Promise<IngresoMaternidad> {
  const payload = {
    fechaIngreso: ingreso.fechaIngreso,
    identificacionMadre: ingreso.identificacionMadre,
    lote: ingreso.lote,
    raza: ingreso.raza,
    ageMeses: ingreso.ageMeses,
    motivoIngreso: ingreso.motivoIngreso,
    responsable: ingreso.responsable,
    observaciones: ingreso.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/ingreso/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar ingreso de maternidad");
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function deleteIngreso(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/ingreso/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar ingreso de maternidad");
}
