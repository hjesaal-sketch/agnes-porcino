import API_BASE from "../../config/api";

export type RegistroMortalidad3 = {
  id: number;
  fecha: string;
  lote: string;
  corral: string;
  cantidad: number;
  causa: string;
  tipo: "Mortalidad" | "Descarte";
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroMortalidad3 = Omit<RegistroMortalidad3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToMort3(api: any): RegistroMortalidad3 {
  return {
    id: api.id,
    fecha: api.fecha,
    lote: api.lote,
    corral: api.corral,
    cantidad: api.cantidad,
    causa: api.causa,
    tipo: api.tipo,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getMortalidadSitio3(): Promise<RegistroMortalidad3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/mortalidad/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener mortalidad/descartes Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToMort3);
}

export async function addMortalidadSitio3(
  reg: NuevoRegistroMortalidad3
): Promise<RegistroMortalidad3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio3/mortalidad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar baja/Descarte Sitio 3");
  }
  const data = await res.json();
  return mapApiToMort3(data);
}

export async function updateMortalidadSitio3(
  id: number,
  reg: NuevoRegistroMortalidad3
): Promise<RegistroMortalidad3> {
  const res = await fetch(
    `${API_BASE}/sitio3/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar baja/Descarte Sitio 3");
  }
  const data = await res.json();
  return mapApiToMort3(data);
}

export async function deleteMortalidadSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/mortalidad/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar registro de mortalidad Sitio 3");
  }
}
