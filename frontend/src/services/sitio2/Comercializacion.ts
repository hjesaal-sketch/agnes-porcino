// src/services/sitio2/Comercializacion.ts
import API_BASE from "../../config/api";

export type RegistroVenta = {
  id: number;
  fecha: string;
  lote: string;
  corral: string;
  cantidad_vendida: number;
  peso_promedio_venta: number;
  destino: string;
  precio_unitario: number;
  responsable: string;
  observaciones: string;
};

export type NuevaVenta = Omit<RegistroVenta, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToVenta(api: any): RegistroVenta {
  return {
    id: api.id,
    fecha: api.fecha,
    lote: api.lote,
    corral: api.corral,
    cantidad_vendida: api.cantidad_vendida,
    peso_promedio_venta: api.peso_promedio_venta,
    destino: api.destino,
    precio_unitario: api.precio_unitario,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getVentasSitio2(): Promise<RegistroVenta[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/comercializacion/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener comercialización Sitio 2");
  }
  const data = await res.json();
  return data.map(mapApiToVenta);
}

export async function addVentaSitio2(
  venta: NuevaVenta
): Promise<RegistroVenta> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...venta,
  };

  const res = await fetch(`${API_BASE}/sitio2/comercializacion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar venta/salida");
  }
  const data = await res.json();
  return mapApiToVenta(data);
}

export async function updateVentaSitio2(
  id: number,
  venta: NuevaVenta
): Promise<RegistroVenta> {
  const res = await fetch(
    `${API_BASE}/sitio2/comercializacion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venta),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar venta/salida");
  }
  const data = await res.json();
  return mapApiToVenta(data);
}

export async function deleteVentaSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/comercializacion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar venta/salida");
  }
}
