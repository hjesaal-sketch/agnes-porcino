// src/services/sitio3/Comercializacion.ts
import API_BASE from "../../config/api";

export type RegistroVenta3 = {
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

export type NuevaVenta3 = Omit<RegistroVenta3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToVenta3(api: any): RegistroVenta3 {
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

export async function getVentasSitio3(): Promise<RegistroVenta3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/comercializacion/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener ventas/salidas Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToVenta3);
}

export async function addVentaSitio3(
  reg: NuevaVenta3
): Promise<RegistroVenta3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...reg,
  };

  const res = await fetch(`${API_BASE}/sitio3/comercializacion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar venta/salida Sitio 3");
  }
  const data = await res.json();
  return mapApiToVenta3(data);
}

export async function updateVentaSitio3(
  id: number,
  reg: NuevaVenta3
): Promise<RegistroVenta3> {
  const res = await fetch(
    `${API_BASE}/sitio3/comercializacion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar venta/salida Sitio 3");
  }
  const data = await res.json();
  return mapApiToVenta3(data);
}

export async function deleteVentaSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/comercializacion/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar venta/salida Sitio 3");
  }
}
