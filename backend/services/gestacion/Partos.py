// src/services/gestacionPartosService.ts
export type PartoProgramado = {
  id: string;
  idMadre: string;
  fechaServicio: string;
  fechaProbableParto: string;
  tipoServicio: "Natural" | "Inseminación" | "Transferencia Embrionaria";
  observaciones: string;
  realizado: boolean;
};

const STORAGE_KEY = "gestacion_partos_programados";

function getAll(): PartoProgramado[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(partos: PartoProgramado[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partos));
}

export function addParto(p: Omit<PartoProgramado, "id">) {
  const nuevo: PartoProgramado = { ...p, id: crypto.randomUUID() };
  const partos = getAll();
  partos.push(nuevo);
  saveAll(partos);
  return nuevo;
}

export function updateParto(id: string, p: Omit<PartoProgramado, "id">) {
  const partos = getAll();
  const idx = partos.findIndex(x => x.id === id);
  if (idx >= 0) {
    partos[idx] = { ...p, id };
    saveAll(partos);
    return partos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteParto(id: string) {
  const partos = getAll().filter(p => p.id !== id);
  saveAll(partos);
}

export function getPartos() {
  return getAll();
}
