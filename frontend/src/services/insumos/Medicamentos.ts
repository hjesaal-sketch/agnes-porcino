// src/services/insumos/Medicamentos.ts
import API_BASE from "../../config/api";

export type Medicamento = {
  id: number;
  nombre: string;
  principio: string;
  lote: string;
  vencimiento: string;
  laboratorio: string;
  tipo: "Vacuna" | "Antibiótico" | "Antiparasitario" | "Desinfectante" | "Otro";
  condiciones: string;
  proveedor: string;
  stock: number;
  unidad: string;
  observaciones: string;
};

export type NuevoMedicamento = Omit<Medicamento, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToMedicamento(api: any): Medicamento {
  return {
    id: api.id,
    nombre: api.nombre,
    principio: api.principio ?? "",
    lote: api.lote ?? "",
    vencimiento: api.vencimiento ?? "",
    laboratorio: api.laboratorio ?? "",
    tipo: api.tipo,
    condiciones: api.condiciones ?? "",
    proveedor: api.proveedor ?? "",
    stock: api.stock,
    unidad: api.unidad,
    observaciones: api.observaciones ?? "",
  };
}

export async function getMedicamentos(): Promise<Medicamento[]> {
  const res = await fetch(
    `${API_BASE}/insumos/medicamentos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener medicamentos");
  }
  const data = await res.json();
  return data.map(mapApiToMedicamento);
}

export async function addMedicamento(
  med: NuevoMedicamento
): Promise<Medicamento> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    nombre: med.nombre,
    principio: med.principio,
    lote: med.lote,
    vencimiento: med.vencimiento || null,
    laboratorio: med.laboratorio,
    tipo: med.tipo,
    condiciones: med.condiciones,
    proveedor: med.proveedor,
    stock: med.stock,
    unidad: med.unidad,
    observaciones: med.observaciones,
  };

  const res = await fetch(`${API_BASE}/insumos/medicamentos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al agregar medicamento");
  }
  const data = await res.json();
  return mapApiToMedicamento(data);
}

export async function updateMedicamento(
  id: number,
  med: NuevoMedicamento
): Promise<Medicamento> {
  const payload = {
    nombre: med.nombre,
    principio: med.principio,
    lote: med.lote,
    vencimiento: med.vencimiento || null,
    laboratorio: med.laboratorio,
    tipo: med.tipo,
    condiciones: med.condiciones,
    proveedor: med.proveedor,
    stock: med.stock,
    unidad: med.unidad,
    observaciones: med.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/insumos/medicamentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar medicamento");
  }
  const data = await res.json();
  return mapApiToMedicamento(data);
}

export async function deleteMedicamento(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/medicamentos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar medicamento");
  }
}
