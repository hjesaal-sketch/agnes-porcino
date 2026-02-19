// src/services/sitio2/Crecimiento.ts
import API_BASE from "../../config/api";

export type RegistroCrecimiento = {
  id: number;
  fecha: string;
  lote: string;
  corral: string;
  cantidad_pesada: number;
  peso_promedio: number;
  responsable: string;
  observaciones: string;
};

export type NuevoRegistroCrecimiento = Omit<RegistroCrecimiento, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCrecimiento(api: any): RegistroCrecimiento {
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

export async function getCrecimientoSitio2(): Promise<RegistroCrecimiento[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/crecimiento/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener registros de crecimiento");
  }
  const data = await res.json();
  return data.map(mapApiToCrecimiento);
}

export async function addCrecimientoSitio2(
  reg: NuevoRegistroCrecimiento
): Promise<RegistroCrecimiento> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio2/crecimiento/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar pesaje");
  }
  const data = await res.json();
  return mapApiToCrecimiento(data);
}

export async function updateCrecimientoSitio2(
  id: number,
  reg: NuevoRegistroCrecimiento
): Promise<RegistroCrecimiento> {
  const res = await fetch(
    `${API_BASE}/sitio2/crecimiento/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar pesaje");
  }
  const data = await res.json();
  return mapApiToCrecimiento(data);
}

export async function deleteCrecimientoSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/crecimiento/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar pesaje");
  }
}
