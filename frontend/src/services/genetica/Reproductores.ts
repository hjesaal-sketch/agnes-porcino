// src/services/genetica/Reproductores.ts
import API_BASE from "../../config/api";

export type Verraco = {
  id: number;
  identificacion: string;
  raza: string;
  fechaNacimiento: string;
  origen: string;
  padre: string;
  madre: string;
  peso: number;
  estadoReproductivo: "Activo" | "Reposo" | "Baja";
  salud: string;
  valorGenetico: string;
  observaciones: string;
};

export type NuevoVerraco = Omit<Verraco, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToVerraco(api: any): Verraco {
  return {
    id: api.id,
    identificacion: api.identificacion,
    raza: api.raza,
    fechaNacimiento: api.fechaNacimiento,
    origen: api.origen,
    padre: api.padre,
    madre: api.madre,
    peso: api.peso,
    estadoReproductivo: api.estadoReproductivo,
    salud: api.salud,
    valorGenetico: api.valorGenetico,
    observaciones: api.observaciones ?? "",
  };
}

export async function getVerracos(): Promise<Verraco[]> {
  const res = await fetch(
    `${API_BASE}/genetica/verracos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener verracos");
  }
  const data = await res.json();
  return data.map(mapApiToVerraco);
}

export async function addVerraco(verraco: NuevoVerraco): Promise<Verraco> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...verraco,
  };

  const res = await fetch(`${API_BASE}/genetica/verracos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar verraco");
  }
  const data = await res.json();
  return mapApiToVerraco(data);
}

export async function updateVerraco(
  id: number,
  verraco: NuevoVerraco
): Promise<Verraco> {
  const payload = { ...verraco };

  const res = await fetch(
    `${API_BASE}/genetica/verracos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar verraco");
  }
  const data = await res.json();
  return mapApiToVerraco(data);
}

export async function deleteVerraco(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/genetica/verracos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar verraco");
  }
}
