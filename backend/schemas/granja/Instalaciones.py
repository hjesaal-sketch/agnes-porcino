// src/services/granjaInstalacionesService.ts
export type InstalacionGranja = {
  id: string;
  nombre: string;
  tipo: "Galpón" | "Depósito" | "Oficina" | "Corral" | "Enfermería" | "Otro";
  superficieM2: number;
  capacidad: string;
  estado: "Operativa" | "Mantenimiento" | "Inactiva";
  descripcion: string;
  ubicacionZona: string; // Puede referenciar id/nombre de zona de Infraestructura
  observaciones: string;
};

const STORAGE_KEY = "granja_instalaciones";

function getAll(): InstalacionGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: InstalacionGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getInstalaciones() {
  return getAll();
}

export function addInstalacion(inst: Omit<InstalacionGranja, "id">) {
  const nueva: InstalacionGranja = { ...inst, id: crypto.randomUUID() };
  const instalaciones = getAll();
  instalaciones.push(nueva);
  saveAll(instalaciones);
  return nueva;
}

export function updateInstalacion(id: string, inst: Omit<InstalacionGranja, "id">) {
  const instalaciones = getAll();
  const idx = instalaciones.findIndex(i => i.id === id);
  if (idx >= 0) {
    instalaciones[idx] = { ...inst, id };
    saveAll(instalaciones);
    return instalaciones[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteInstalacion(id: string) {
  const instalaciones = getAll().filter(i => i.id !== id);
  saveAll(instalaciones);
}
