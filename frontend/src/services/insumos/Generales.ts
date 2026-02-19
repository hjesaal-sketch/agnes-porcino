// src/services/Generales.ts
import API_BASE from "../../config/api";

export type InsumoGeneral = {
  id: number;
  descripcion: string;
  categoria: "Oficina" | "Identificación" | "Empaque" | "Repuestos" | "Otro";
  cantidad: number;
  unidad: string;
  stock: number;
  proveedor: string;
  observaciones: string;
};

export type NuevoInsumoGeneral = Omit<InsumoGeneral, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToInsumo(api: any): InsumoGeneral {
  return {
    id: api.id,
    descripcion: api.descripcion,
    categoria: api.categoria,
    cantidad: api.cantidad,
    unidad: api.unidad,
    stock: api.stock,
    proveedor: api.proveedor ?? "",
    observaciones: api.observaciones ?? "",
  };
}

export async function getInsumosGenerales(): Promise<InsumoGeneral[]> {
  const res = await fetch(
    `${API_BASE}/insumos/generales/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener insumos generales");
  }
  const data = await res.json();
  return data.map(mapApiToInsumo);
}

export async function addInsumoGeneral(
  insumo: NuevoInsumoGeneral
): Promise<InsumoGeneral> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    descripcion: insumo.descripcion,
    categoria: insumo.categoria,
    cantidad: insumo.cantidad,
    unidad: insumo.unidad,
    stock: insumo.stock,
    proveedor: insumo.proveedor,
    observaciones: insumo.observaciones,
  };

  const res = await fetch(`${API_BASE}/insumos/generales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al agregar insumo general");
  }
  const data = await res.json();
  return mapApiToInsumo(data);
}

export async function updateInsumoGeneral(
  id: number,
  insumo: NuevoInsumoGeneral
): Promise<InsumoGeneral> {
  const payload = {
    descripcion: insumo.descripcion,
    categoria: insumo.categoria,
    cantidad: insumo.cantidad,
    unidad: insumo.unidad,
    stock: insumo.stock,
    proveedor: insumo.proveedor,
    observaciones: insumo.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/insumos/generales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar insumo general");
  }
  const data = await res.json();
  return mapApiToInsumo(data);
}

export async function deleteInsumoGeneral(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/generales/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar insumo general");
  }
}
