// src/services/granja/Personal.ts
import API_BASE from "../../config/api";

export type PersonalGranja = {
  id: number;
  nombre: string;
  cargo: string;
  turno: "Mañana" | "Tarde" | "Noche" | "Rotativo";
  capacitaciones: string;
  fechaIngreso: string;
  estado: "Activo" | "Suspendido" | "Baja";
  contacto: string;
  organigrama: string;
  observaciones: string;
};

export type NuevoPersonalGranja = Omit<PersonalGranja, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToPersonal(api: any): PersonalGranja {
  return {
    id: api.id,
    nombre: api.nombre,
    cargo: api.cargo,
    turno: api.turno,
    capacitaciones: api.capacitaciones,
    fechaIngreso: api.fechaIngreso,
    estado: api.estado,
    contacto: api.contacto,
    organigrama: api.organigrama,
    observaciones: api.observaciones ?? "",
  };
}

export async function getPersonal(): Promise<PersonalGranja[]> {
  const res = await fetch(
    `${API_BASE}/granja/personal/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener personal de la granja");
  }
  const data = await res.json();
  return data.map(mapApiToPersonal);
}

export async function addPersonal(
  pers: NuevoPersonalGranja
): Promise<PersonalGranja> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    nombre: pers.nombre,
    cargo: pers.cargo,
    turno: pers.turno,
    capacitaciones: pers.capacitaciones,
    fechaIngreso: pers.fechaIngreso,
    estado: pers.estado,
    contacto: pers.contacto,
    organigrama: pers.organigrama,
    observaciones: pers.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/personal/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar personal");
  }
  const data = await res.json();
  return mapApiToPersonal(data);
}

export async function updatePersonal(
  id: number,
  pers: NuevoPersonalGranja
): Promise<PersonalGranja> {
  const payload = {
    nombre: pers.nombre,
    cargo: pers.cargo,
    turno: pers.turno,
    capacitaciones: pers.capacitaciones,
    fechaIngreso: pers.fechaIngreso,
    estado: pers.estado,
    contacto: pers.contacto,
    organigrama: pers.organigrama,
    observaciones: pers.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/personal/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar personal");
  }
  const data = await res.json();
  return mapApiToPersonal(data);
}

export async function deletePersonal(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/personal/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar personal");
  }
}
