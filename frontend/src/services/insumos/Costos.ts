// src/services/Costos.ts
import API_BASE from "../../config/api";

export type CostoInsumo = {
  id: number;
  fecha: string;
  modulo: string;
  categoria:
    | "Medicamento/Vacuna"
    | "Alimento"
    | "Equipo/Herramienta"
    | "Limpieza"
    | "Suministro General";
  insumo: string;
  lote?: string | null;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  costoTotal: number;
  proveedor?: string | null;
  descripcion: string;
  presupuesto?: number;
  real?: number;
  variacion?: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToCosto(api: any): CostoInsumo {
  const costoTotal = api.costo_total ?? 0;
  const presupuesto = api.presupuesto ?? costoTotal;
  const real = api.real ?? costoTotal;
  const variacion = real - presupuesto;

  return {
    id: api.id,
    fecha: api.fecha,
    modulo: api.modulo,
    categoria: api.categoria,
    insumo: api.insumo,
    lote: api.lote ?? null,
    cantidad: api.cantidad,
    unidad: api.unidad,
    costoUnitario: api.costo_unitario,
    costoTotal,
    proveedor: api.proveedor ?? null,
    descripcion: api.descripcion ?? "",
    presupuesto,
    real,
    variacion,
  };
}

export async function getCostos(): Promise<CostoInsumo[]> {
  const res = await fetch(
    `${API_BASE}/insumos/costos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener costos de insumos");
  }
  const data = await res.json();
  return data.map(mapApiToCosto);
}

export type NuevoCostoInsumo = {
  fecha: string;
  modulo: string;
  categoria: CostoInsumo["categoria"];
  insumo: string;
  lote?: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  costoTotal: number;
  proveedor?: string;
  descripcion: string;
};

export async function addCosto(
  costo: NuevoCostoInsumo
): Promise<CostoInsumo> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: costo.fecha,
    modulo: costo.modulo,
    categoria: costo.categoria,
    insumo: costo.insumo,
    lote: costo.lote || null,
    cantidad: costo.cantidad,
    unidad: costo.unidad,
    costo_unitario: costo.costoUnitario,
    costo_total: costo.costoTotal,
    proveedor: costo.proveedor || null,
    descripcion: costo.descripcion,
  };

  const res = await fetch(`${API_BASE}/insumos/costos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar costo de insumo");
  }
  const data = await res.json();
  return mapApiToCosto(data);
}

export async function updateCosto(
  id: number,
  costo: NuevoCostoInsumo
): Promise<CostoInsumo> {
  const payload = {
    fecha: costo.fecha,
    modulo: costo.modulo,
    categoria: costo.categoria,
    insumo: costo.insumo,
    lote: costo.lote || null,
    cantidad: costo.cantidad,
    unidad: costo.unidad,
    costo_unitario: costo.costoUnitario,
    costo_total: costo.costoTotal,
    proveedor: costo.proveedor || null,
    descripcion: costo.descripcion,
  };

  const res = await fetch(
    `${API_BASE}/insumos/costos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar costo de insumo");
  }
  const data = await res.json();
  return mapApiToCosto(data);
}

export async function deleteCosto(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/costos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar costo de insumo");
  }
}
