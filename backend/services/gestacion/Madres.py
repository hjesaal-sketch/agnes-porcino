// src/services/gestacionMadresService.ts
export type MadreGestante = {
  id: string; // UUID siempre
  fechaIngreso: string;
  identificacion: string;
  raza: string;
  edadMeses: number;
  lote: string;
  estado: "Gestante" | "Vacía" | "Parida";
  observaciones: string;
};

const STORAGE_KEY = "gestacion_madres";

function getAll(): MadreGestante[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(madres: MadreGestante[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(madres));
}

export function addMadre(madre: Omit<MadreGestante, "id">) {
  const nuevo: MadreGestante = { ...madre, id: crypto.randomUUID() };
  const madres = getAll();
  madres.push(nuevo);
  saveAll(madres);
  return nuevo;
}

export function updateMadre(id: string, madre: Omit<MadreGestante, "id">) {
  const madres = getAll();
  const idx = madres.findIndex(m => m.id === id);
  if (idx >= 0) {
    madres[idx] = { ...madre, id };
    saveAll(madres);
    return madres[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteMadre(id: string) {
  const madres = getAll().filter(m => m.id !== id);
  saveAll(madres);
}

export function getMadres() {
  return getAll();
}
