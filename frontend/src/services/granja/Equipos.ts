import API_BASE from "../../config/api";

export type EquipoGranja = {
  id: number;
  descripcion: string;
  categoria:
    | "Maquinaria"
    | "Herramienta"
    | "Equipo Electrónico"
    | "Vehículo"
    | "Otro";
  marca: string;
  modelo: string;
  cantidad: number;
  estado: "Operativo" | "Mantenimiento" | "Baja";
  ubicacion: string;
  responsable: string;
  observaciones: string;
};

export type NuevoEquipoGranja = Omit<EquipoGranja, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEquipo(api: any): EquipoGranja {
  return {
    id: api.id,
    descripcion: api.descripcion,
    categoria: api.categoria,
    marca: api.marca,
    modelo: api.modelo,
    cantidad: api.cantidad,
    estado: api.estado,
    ubicacion: api.ubicacion,
    responsable: api.responsable ?? "",
    observaciones: api.observaciones ?? "",
  };
}

export async function getEquiposGranja(): Promise<EquipoGranja[]> {
  const res = await fetch(
    `${API_BASE}/granja/equipos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener equipos de granja");
  }
  const data = await res.json();
  return data.map(mapApiToEquipo);
}

export async function addEquipoGranja(
  equipo: NuevoEquipoGranja
): Promise<EquipoGranja> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    descripcion: equipo.descripcion,
    categoria: equipo.categoria,
    marca: equipo.marca,
    modelo: equipo.modelo,
    cantidad: equipo.cantidad,
    estado: equipo.estado,
    ubicacion: equipo.ubicacion,
    responsable: equipo.responsable,
    observaciones: equipo.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/equipos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar equipo");
  }
  const data = await res.json();
  return mapApiToEquipo(data);
}

export async function updateEquipoGranja(
  id: number,
  equipo: NuevoEquipoGranja
): Promise<EquipoGranja> {
  const payload = {
    descripcion: equipo.descripcion,
    categoria: equipo.categoria,
    marca: equipo.marca,
    modelo: equipo.modelo,
    cantidad: equipo.cantidad,
    estado: equipo.estado,
    ubicacion: equipo.ubicacion,
    responsable: equipo.responsable,
    observaciones: equipo.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/equipos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar equipo");
  }
  const data = await res.json();
  return mapApiToEquipo(data);
}

export async function deleteEquipoGranja(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/equipos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar equipo");
  }
}
