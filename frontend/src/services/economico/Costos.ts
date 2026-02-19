// src/services/Costos.ts
import API_BASE from "../../config/api";

export type CostoEconomico = {
  id: number;
  fecha: string;
  categoria: "Fijo" | "Variable" | "Indirecto" | "Otro";
  concepto: string;
  monto: number;
  responsable: string;
  descripcion: string;
};

export type NuevoCostoEconomico = Omit<CostoEconomico, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCosto(api: any): CostoEconomico {
  return {
    id: api.id,
    fecha: api.fecha,
    categoria: api.categoria,
    concepto: api.concepto,
    monto: api.monto,
    responsable: api.responsable,
    descripcion: api.descripcion ?? "",
  };
}

export async function getCostos(): Promise<CostoEconomico[]> {
  const res = await fetch(
    `${API_BASE}/economico/costos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener costos económicos");
  }
  const data = await res.json();
  return data.map(mapApiToCosto);
}

export async function addCosto(
  c: NuevoCostoEconomico
): Promise<CostoEconomico> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...c,
  };
  const res = await fetch(`${API_BASE}/economico/costos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear costo económico");
  }
  const data = await res.json();
  return mapApiToCosto(data);
}

export async function updateCosto(
  id: number,
  c: NuevoCostoEconomico
): Promise<CostoEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/costos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar costo económico");
  }
  const data = await res.json();
  return mapApiToCosto(data);
}

export async function deleteCosto(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/economico/costos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar costo económico");
  }
}
