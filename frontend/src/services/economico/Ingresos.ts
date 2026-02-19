import API_BASE from "../../config/api";

export type IngresoEconomico = {
  id: number;
  fecha: string;
  fuente: string;
  tipo: "Venta producción" | "Subvención" | "Préstamo" | "Otro";
  monto: number;
  responsable: string;
  descripcion: string;
};

export type NuevoIngresoEconomico = Omit<IngresoEconomico, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIngreso(api: any): IngresoEconomico {
  return {
    id: api.id,
    fecha: api.fecha,
    fuente: api.fuente,
    tipo: api.tipo,
    monto: api.monto,
    responsable: api.responsable,
    descripcion: api.descripcion ?? "",
  };
}

export async function getIngresos(): Promise<IngresoEconomico[]> {
  const res = await fetch(
    `${API_BASE}/economico/ingresos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener ingresos económicos");
  }
  const data = await res.json();
  return data.map(mapApiToIngreso);
}

export async function addIngreso(
  ing: NuevoIngresoEconomico
): Promise<IngresoEconomico> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...ing,
  };
  const res = await fetch(`${API_BASE}/economico/ingresos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear ingreso económico");
  }
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function updateIngreso(
  id: number,
  ing: NuevoIngresoEconomico
): Promise<IngresoEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ing),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar ingreso económico");
  }
  const data = await res.json();
  return mapApiToIngreso(data);
}

export async function deleteIngreso(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/economico/ingresos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar ingreso económico");
  }
}
