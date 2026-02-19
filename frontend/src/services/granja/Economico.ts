// src/services/granja/Economico.ts
import API_BASE from "../../config/api";

export type MovimientoEconomico = {
  id: number;
  fecha: string;
  tipo: "Costo fijo" | "Costo variable" | "Venta" | "Otro";
  descripcion: string;
  categoria: string;
  monto: number;
  responsable: string;
  comentarios: string;
};

export type NuevoMovimientoEconomico = Omit<MovimientoEconomico, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToMovimiento(api: any): MovimientoEconomico {
  return {
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    descripcion: api.descripcion,
    categoria: api.categoria,
    monto: api.monto,
    responsable: api.responsable ?? "",
    comentarios: api.comentarios ?? "",
  };
}

export async function getMovimientos(): Promise<MovimientoEconomico[]> {
  const res = await fetch(
    `${API_BASE}/granja/economico/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener movimientos económicos");
  }
  const data = await res.json();
  return data.map(mapApiToMovimiento);
}

export async function addMovimiento(
  mov: NuevoMovimientoEconomico
): Promise<MovimientoEconomico> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: mov.fecha,
    tipo: mov.tipo,
    descripcion: mov.descripcion,
    categoria: mov.categoria,
    monto: mov.monto,
    responsable: mov.responsable,
    comentarios: mov.comentarios,
  };

  const res = await fetch(`${API_BASE}/granja/economico/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar movimiento económico");
  }
  const data = await res.json();
  return mapApiToMovimiento(data);
}

export async function updateMovimiento(
  id: number,
  mov: NuevoMovimientoEconomico
): Promise<MovimientoEconomico> {
  const payload = {
    fecha: mov.fecha,
    tipo: mov.tipo,
    descripcion: mov.descripcion,
    categoria: mov.categoria,
    monto: mov.monto,
    responsable: mov.responsable,
    comentarios: mov.comentarios,
  };

  const res = await fetch(
    `${API_BASE}/granja/economico/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar movimiento económico");
  }
  const data = await res.json();
  return mapApiToMovimiento(data);
}

export async function deleteMovimiento(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/economico/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar movimiento económico");
  }
}
