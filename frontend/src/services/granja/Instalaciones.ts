import API_BASE from "../../config/api";

export type InstalacionGranja = {
  id: number;
  nombre: string;
  tipo: "Galpón" | "Depósito" | "Oficina" | "Corral" | "Enfermería" | "Otro";
  superficieM2: number;
  capacidad: string;
  estado: "Operativa" | "Mantenimiento" | "Inactiva";
  descripcion: string;
  ubicacionZona: string;
  observaciones: string;
};

export type NuevaInstalacionGranja = Omit<InstalacionGranja, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToInst(api: any): InstalacionGranja {
  return {
    id: api.id,
    nombre: api.nombre,
    tipo: api.tipo,
    superficieM2: api.superficieM2,
    capacidad: api.capacidad,
    estado: api.estado,
    descripcion: api.descripcion,
    ubicacionZona: api.ubicacionZona,
    observaciones: api.observaciones ?? "",
  };
}

export async function getInstalaciones(): Promise<InstalacionGranja[]> {
  const res = await fetch(
    `${API_BASE}/granja/instalaciones/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener instalaciones de la granja");
  }
  const data = await res.json();
  return data.map(mapApiToInst);
}

export async function addInstalacion(
  inst: NuevaInstalacionGranja
): Promise<InstalacionGranja> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    nombre: inst.nombre,
    tipo: inst.tipo,
    superficieM2: inst.superficieM2,
    capacidad: inst.capacidad,
    estado: inst.estado,
    descripcion: inst.descripcion,
    ubicacionZona: inst.ubicacionZona,
    observaciones: inst.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/instalaciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar instalación");
  }
  const data = await res.json();
  return mapApiToInst(data);
}

export async function updateInstalacion(
  id: number,
  inst: NuevaInstalacionGranja
): Promise<InstalacionGranja> {
  const payload = {
    nombre: inst.nombre,
    tipo: inst.tipo,
    superficieM2: inst.superficieM2,
    capacidad: inst.capacidad,
    estado: inst.estado,
    descripcion: inst.descripcion,
    ubicacionZona: inst.ubicacionZona,
    observaciones: inst.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/instalaciones/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar instalación");
  }
  const data = await res.json();
  return mapApiToInst(data);
}

export async function deleteInstalacion(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/instalaciones/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar instalación");
  }
}
