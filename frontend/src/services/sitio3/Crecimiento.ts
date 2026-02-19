import API_BASE from "../../config/api";

export type RegistroCrecimiento3 = {
  id: number;
  fecha: string;
  lote: string;
  corral: string;
  cantidad_pesada: number;
  peso_promedio: number;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroCrecimiento3 = Omit<RegistroCrecimiento3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCrec3(api: any): RegistroCrecimiento3 {
  return {
    id: api.id,
    fecha: api.fecha,
    lote: api.lote,
    corral: api.corral,
    cantidad_pesada: api.cantidad_pesada,
    peso_promedio: api.peso_promedio,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getCrecimientoSitio3(): Promise<RegistroCrecimiento3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/crecimiento/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener pesajes Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToCrec3);
}

export async function addCrecimientoSitio3(
  reg: NuevoRegistroCrecimiento3
): Promise<RegistroCrecimiento3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio3/crecimiento/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar pesaje Sitio 3");
  }
  const data = await res.json();
  return mapApiToCrec3(data);
}

export async function updateCrecimientoSitio3(
  id: number,
  reg: NuevoRegistroCrecimiento3
): Promise<RegistroCrecimiento3> {
  const res = await fetch(
    `${API_BASE}/sitio3/crecimiento/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar pesaje Sitio 3");
  }
  const data = await res.json();
  return mapApiToCrec3(data);
}

export async function deleteCrecimientoSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/crecimiento/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar pesaje Sitio 3");
  }
}
