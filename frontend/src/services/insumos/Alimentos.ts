// src/services/Alimentos.ts
import API_BASE from "../../config/api";

export type Alimento = {
  id: number;
  tipo: string;
  fase: string;
  proteina: string;
  energiaKcal: string;
  presentacion: string;
  proveedor: string;
  lote: string;
  cantidad: number;
  unidad: string;
  stock: number;
  vencimiento: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToAlimento(api: any): Alimento {
  return {
    id: api.id,
    tipo: api.tipo,
    fase: api.fase,
    proteina: api.proteina ?? "",
    energiaKcal: api.energiaKcal ?? api.energia_kcal ?? "",
    presentacion: api.presentacion ?? "",
    proveedor: api.proveedor ?? "",
    lote: api.lote ?? "",
    cantidad: api.cantidad,
    unidad: api.unidad,
    stock: api.stock,
    vencimiento: api.vencimiento ?? "",
    observaciones: api.observaciones ?? "",
  };
}

export async function getAlimentos(): Promise<Alimento[]> {
  const res = await fetch(
    `${API_BASE}/insumos/alimentos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener alimentos");
  const data = await res.json();
  return data.map(mapApiToAlimento);
}

export type NuevoAlimento = Omit<Alimento, "id">;

export async function addAlimento(alimento: NuevoAlimento): Promise<Alimento> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    tipo: alimento.tipo,
    fase: alimento.fase,
    proteina: alimento.proteina,
    energiaKcal: alimento.energiaKcal,
    presentacion: alimento.presentacion,
    proveedor: alimento.proveedor,
    lote: alimento.lote,
    cantidad: alimento.cantidad,
    unidad: alimento.unidad,
    stock: alimento.stock,
    vencimiento: alimento.vencimiento || null,
    observaciones: alimento.observaciones,
  };

  const res = await fetch(`${API_BASE}/insumos/alimentos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al agregar alimento");
  const data = await res.json();
  return mapApiToAlimento(data);
}

export async function updateAlimento(
  id: number,
  alimento: NuevoAlimento
): Promise<Alimento> {
  const payload = {
    tipo: alimento.tipo,
    fase: alimento.fase,
    proteina: alimento.proteina,
    energiaKcal: alimento.energiaKcal,
    presentacion: alimento.presentacion,
    proveedor: alimento.proveedor,
    lote: alimento.lote,
    cantidad: alimento.cantidad,
    unidad: alimento.unidad,
    stock: alimento.stock,
    vencimiento: alimento.vencimiento || null,
    observaciones: alimento.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/insumos/alimentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar alimento");
  const data = await res.json();
  return mapApiToAlimento(data);
}

export async function deleteAlimento(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/alimentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar alimento");
}
