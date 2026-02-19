import API_BASE from "../../config/api";

export type RegistroNutricion3 = {
  id: number;
  fecha: string;
  corral: string;
  lote: string;
  dieta: string;
  alimento_consumido: number;
  suplemento: string;
  cantidad_suplemento: number;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroNutricion3 = Omit<RegistroNutricion3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToNut3(api: any): RegistroNutricion3 {
  return {
    id: api.id,
    fecha: api.fecha,
    corral: api.corral,
    lote: api.lote,
    dieta: api.dieta,
    alimento_consumido: api.alimento_consumido,
    suplemento: api.suplemento,
    cantidad_suplemento: api.cantidad_suplemento,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getNutricionSitio3(): Promise<RegistroNutricion3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/nutricion/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener registros nutricionales Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToNut3);
}

export async function addNutricionSitio3(
  reg: NuevoRegistroNutricion3
): Promise<RegistroNutricion3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio3/nutricion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar nutrición Sitio 3");
  }
  const data = await res.json();
  return mapApiToNut3(data);
}

export async function updateNutricionSitio3(
  id: number,
  reg: NuevoRegistroNutricion3
): Promise<RegistroNutricion3> {
  const res = await fetch(
    `${API_BASE}/sitio3/nutricion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar nutrición Sitio 3");
  }
  const data = await res.json();
  return mapApiToNut3(data);
}

export async function deleteNutricionSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/nutricion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar registro nutricional Sitio 3");
  }
}
