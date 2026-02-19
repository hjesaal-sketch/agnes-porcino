// src/services/maternidadPartosService.ts
export type PartoMaternidad = {
  id: string;
  fechaParto: string;
  identificacionMadre: string;
  nacidosVivos: number;
  nacidosMuertos: number;
  lechonesViables: number;
  pesoTotal: number;
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_partos";

function getAll(): PartoMaternidad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(partos: PartoMaternidad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partos));
}

export function addParto(parto: Omit<PartoMaternidad, "id">) {
  const nuevo: PartoMaternidad = { ...parto, id: crypto.randomUUID() };
  const partos = getAll();
  partos.push(nuevo);
  saveAll(partos);
  return nuevo;
}

export function updateParto(id: string, parto: Omit<PartoMaternidad, "id">) {
  const partos = getAll();
  const idx = partos.findIndex(x => x.id === id);
  if (idx >= 0) {
    partos[idx] = { ...parto, id };
    saveAll(partos);
    return partos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteParto(id: string) {
  const partos = getAll().filter(x => x.id !== id);
  saveAll(partos);
}

export function getPartos() {
  return getAll();
}
