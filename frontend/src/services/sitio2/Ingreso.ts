// src/services/sitio2/Ingreso.ts
import API_BASE from "../../config/api";

export type IngresoEngorde = {
  id: number;
  fecha: string;
  lote: string;
  cantidad: number;
  peso_promedio: number;
  corral_destino: string;
  proveedor: string;
  responsable: string;
  observaciones: string;
};

export type NuevoIngresoEngorde = Omit<IngresoEngorde, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIngreso(api: any): IngresoEngorde {
  return {
    id: api.id,
    fecha: api.fecha,
    lote: api.lote,
    cantidad: api.cantidad,
    peso_promedio: api.peso_promedio,
    corral_destino: api.corral_destino,
    proveedor: api.proveedor,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getIngresosSitio2(): Promise<IngresoEngorde[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/ingresos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener ingresos de engorde");
  }
  const data = await res.json();
  return data.map(mapApiToIngreso);
}

export async function addIngresoSitio2(
  ingreso: NuevoIngresoEngorde
): Promise<IngresoEngorde> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...ingreso,
  };

  const res = await fetch(`${API_BASE}/sitio2/ingresos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar ingreso");
  }
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function updateIngresoSitio2(
  id: number,
  ingreso: NuevoIngresoEngorde
): Promise<IngresoEngorde> {
  const res = await fetch(
    `${API_BASE}/sitio2/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingreso),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar ingreso");
  }
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function deleteIngresoSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar ingreso");
  }
}
