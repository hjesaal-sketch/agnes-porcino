// src/services/Impuestos.ts
import API_BASE from "../../config/api";

export type ImpuestoEconomico = {
  id: number;
  fecha: string;
  tipo: "IVA" | "ISLR" | "Arancel" | "Otro";
  monto: number;
  descripcion: string;
  pagado: boolean;
  vencimiento: string;
  responsable: string;
};

export type NuevoImpuestoEconomico = Omit<ImpuestoEconomico, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToImpuesto(api: any): ImpuestoEconomico {
  return {
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    monto: api.monto,
    descripcion: api.descripcion ?? "",
    pagado: Boolean(api.pagado),
    vencimiento: api.vencimiento,
    responsable: api.responsable,
  };
}

export async function getImpuestos(): Promise<ImpuestoEconomico[]> {
  const res = await fetch(
    `${API_BASE}/economico/impuestos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener impuestos económicos");
  }
  const data = await res.json();
  return data.map(mapApiToImpuesto);
}

export async function addImpuesto(
  i: NuevoImpuestoEconomico
): Promise<ImpuestoEconomico> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...i,
  };
  const res = await fetch(`${API_BASE}/economico/impuestos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear impuesto económico");
  }
  const data = await res.json();
  return mapApiToImpuesto(data);
}

export async function updateImpuesto(
  id: number,
  i: NuevoImpuestoEconomico
): Promise<ImpuestoEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/impuestos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar impuesto económico");
  }
  const data = await res.json();
  return mapApiToImpuesto(data);
}

export async function deleteImpuesto(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/economico/impuestos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar impuesto económico");
  }
}
