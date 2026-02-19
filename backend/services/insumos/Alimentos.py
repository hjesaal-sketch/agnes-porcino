// src/services/insumosAlimentosService.ts
export type Alimento = {
  id: string;
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

const STORAGE_KEY = "insumos_alimentos";

function getAll(): Alimento[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: Alimento[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getAlimentos() {
  return getAll();
}

export function addAlimento(alimento: Omit<Alimento, "id">) {
  const nuevo: Alimento = { ...alimento, id: crypto.randomUUID() };
  const alimentos = getAll();
  alimentos.push(nuevo);
  saveAll(alimentos);
  return nuevo;
}

export function updateAlimento(id: string, alimento: Omit<Alimento, "id">) {
  const alimentos = getAll();
  const idx = alimentos.findIndex(a => a.id === id);
  if (idx >= 0) {
    alimentos[idx] = { ...alimento, id };
    saveAll(alimentos);
    return alimentos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteAlimento(id: string) {
  const alimentos = getAll().filter(a => a.id !== id);
  saveAll(alimentos);
}
