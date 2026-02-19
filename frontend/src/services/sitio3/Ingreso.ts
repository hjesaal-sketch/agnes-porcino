//src/services/sitio3/Ingreso.ts
import API_BASE from "../../config/api";

export type IngresoEngorde3 = {
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

export type NuevoIngresoEngorde3 = Omit<IngresoEngorde3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIngreso3(api: any): IngresoEngorde3 {
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

export async function getIngresosSitio3(): Promise<IngresoEngorde3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/ingresos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener ingresos Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToIngreso3);
}

export async function addIngresoSitio3(
  ingreso: NuevoIngresoEngorde3
): Promise<IngresoEngorde3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...ingreso,
  };

  const res = await fetch(`${API_BASE}/sitio3/ingresos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar ingreso Sitio 3");
  }
  const data = await res.json();
  return mapApiToIngreso3(data);
}

export async function updateIngresoSitio3(
  id: number,
  ingreso: NuevoIngresoEngorde3
): Promise<IngresoEngorde3> {
  const res = await fetch(
    `${API_BASE}/sitio3/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingreso),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar ingreso Sitio 3");
  }
  const data = await res.json();
  return mapApiToIngreso3(data);
}

export async function deleteIngresoSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar ingreso Sitio 3");
  }
}
