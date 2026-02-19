import API_BASE from "../../config/api";

export type RegistroSalud3 = {
  id: number;
  fecha: string;
  corral: string;
  lote: string;
  evento: string;
  tratamiento: string;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroSalud3 = Omit<RegistroSalud3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToSalud3(api: any): RegistroSalud3 {
  return {
    id: api.id,
    fecha: api.fecha,
    corral: api.corral,
    lote: api.lote,
    evento: api.evento,
    tratamiento: api.tratamiento,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getSaludSitio3(): Promise<RegistroSalud3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/salud/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener eventos de salud Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToSalud3);
}

export async function addSaludSitio3(
  reg: NuevoRegistroSalud3
): Promise<RegistroSalud3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio3/salud/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar evento de salud Sitio 3");
  }
  const data = await res.json();
  return mapApiToSalud3(data);
}

export async function updateSaludSitio3(
  id: number,
  reg: NuevoRegistroSalud3
): Promise<RegistroSalud3> {
  const res = await fetch(
    `${API_BASE}/sitio3/salud/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar evento de salud Sitio 3");
  }
  const data = await res.json();
  return mapApiToSalud3(data);
}

export async function deleteSaludSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/salud/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar evento de salud Sitio 3");
  }
}
