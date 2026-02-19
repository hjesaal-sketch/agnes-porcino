// src/services/maternidadMortandadService.ts
export type MortalidadMaternidad = {
  id: string;
  fecha: string;
  identificacionMadre: string;
  tipo: "Madre" | "Lechón";
  causa: string;
  cantidad: number;
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_mortalidad";

function getAll(): MortalidadMaternidad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(registros: MortalidadMaternidad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

export function addMortalidad(registro: Omit<MortalidadMaternidad, "id">) {
  const nuevo: MortalidadMaternidad = { ...registro, id: crypto.randomUUID() };
  const registros = getAll();
  registros.push(nuevo);
  saveAll(registros);
  return nuevo;
}

export function updateMortalidad(id: string, registro: Omit<MortalidadMaternidad, "id">) {
  const registros = getAll();
  const idx = registros.findIndex(x => x.id === id);
  if (idx >= 0) {
    registros[idx] = { ...registro, id };
    saveAll(registros);
    return registros[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteMortalidad(id: string) {
  const registros = getAll().filter(x => x.id !== id);
  saveAll(registros);
}

export function getRegistrosMortalidad() {
  return getAll();
}
