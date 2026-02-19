// src/services/Salud.ts
import API_BASE from "../../config/api";

export type SaludMaternidad = {
  id: number;
  fecha: string;
  identificacionMadre: string;
  tipoPaciente: "Madre" | "Lechones";
  evento: "Vacunación" | "Tratamiento" | "Revisión" | "Muestra" | "Otro";
  descripcion: string;
  responsable: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToSalud(api: any): SaludMaternidad {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacionMadre: api.identificacionMadre,
    tipoPaciente: api.tipoPaciente,
    evento: api.evento,
    descripcion: api.descripcion,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getRegistrosSalud(): Promise<SaludMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/salud/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener registros de salud");
  const data = await res.json();
  return data.map(mapApiToSalud);
}

export type NuevaSaludMaternidad = Omit<SaludMaternidad, "id">;

export async function addSalud(
  registro: NuevaSaludMaternidad
): Promise<SaludMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    tipoPaciente: registro.tipoPaciente,
    evento: registro.evento,
    descripcion: registro.descripcion,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/salud/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar evento de salud");
  const data = await res.json();
  return mapApiToSalud(data);
}

export async function updateSalud(
  id: number,
  registro: NuevaSaludMaternidad
): Promise<SaludMaternidad> {
  const payload = {
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    tipoPaciente: registro.tipoPaciente,
    evento: registro.evento,
    descripcion: registro.descripcion,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/salud/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar evento de salud");
  const data = await res.json();
  return mapApiToSalud(data);
}

export async function deleteSalud(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/salud/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar evento de salud");
}
