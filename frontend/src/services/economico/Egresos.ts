//src/services/economico/Egresos.ts
import API_BASE from "../../config/api";

export type EgresoEconomico = {
  id: number;
  fecha: string;
  beneficiario: string;
  tipo: "Compra insumos" | "Pago servicios" | "Salarios" | "Otro";
  monto: number;
  responsable: string;
  descripcion: string;
};

export type NuevoEgresoEconomico = Omit<EgresoEconomico, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEgreso(api: any): EgresoEconomico {
  return {
    id: api.id,
    fecha: api.fecha,
    beneficiario: api.beneficiario,
    tipo: api.tipo,
    monto: api.monto,
    responsable: api.responsable,
    descripcion: api.descripcion ?? "",
  };
}

export async function getEgresos(): Promise<EgresoEconomico[]> {
  const res = await fetch(
    `${API_BASE}/economico/egresos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener egresos económicos");
  }
  const data = await res.json();
  return data.map(mapApiToEgreso);
}

export async function addEgreso(
  eg: NuevoEgresoEconomico
): Promise<EgresoEconomico> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...eg,
  };
  const res = await fetch(`${API_BASE}/economico/egresos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear egreso económico");
  }
  const data = await res.json();
  return mapApiToEgreso(data);
}

export async function updateEgreso(
  id: number,
  eg: NuevoEgresoEconomico
): Promise<EgresoEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/egresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar egreso económico");
  }
  const data = await res.json();
  return mapApiToEgreso(data);
}

export async function deleteEgreso(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/economico/egresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar egreso económico");
  }
}
