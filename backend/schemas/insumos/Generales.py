// src/services/insumosGeneralesService.ts
export type InsumoGeneral = {
  id: string;
  descripcion: string;
  categoria: "Oficina" | "Identificación" | "Empaque" | "Repuestos" | "Otro";
  cantidad: number;
  unidad: string;
  stock: number;
  proveedor: string;
  observaciones: string;
};

const STORAGE_KEY = "insumos_generales";

function getAll(): InsumoGeneral[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: InsumoGeneral[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getInsumosGenerales() {
  return getAll();
}

export function addInsumoGeneral(insumo: Omit<InsumoGeneral, "id">) {
  const nuevo: InsumoGeneral = { ...insumo, id: crypto.randomUUID() };
  const insumos = getAll();
  insumos.push(nuevo);
  saveAll(insumos);
  return nuevo;
}

export function updateInsumoGeneral(id: string, insumo: Omit<InsumoGeneral, "id">) {
  const insumos = getAll();
  const idx = insumos.findIndex(i => i.id === id);
  if (idx >= 0) {
    insumos[idx] = { ...insumo, id };
    saveAll(insumos);
    return insumos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteInsumoGeneral(id: string) {
  const insumos = getAll().filter(i => i.id !== id);
  saveAll(insumos);
}
