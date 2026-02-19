// src/services/geneticaReproductoresService.ts
export type Verraco = {
  id: string;
  identificacion: string;
  raza: string;
  fechaNacimiento: string;
  origen: string;
  padre: string;
  madre: string;
  peso: number;
  estadoReproductivo: "Activo" | "Reposo" | "Baja";
  salud: string;
  valorGenetico: string;
  observaciones: string;
};

const STORAGE_KEY = "genetica_reproductores";

function getAll(): Verraco[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: Verraco[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getVerracos() {
  return getAll();
}

export function addVerraco(verraco: Omit<Verraco, "id">) {
  const nuevo: Verraco = { ...verraco, id: crypto.randomUUID() };
  const verracos = getAll();
  verracos.push(nuevo);
  saveAll(verracos);
  return nuevo;
}

export function updateVerraco(id: string, verraco: Omit<Verraco, "id">) {
  const verracos = getAll();
  const idx = verracos.findIndex(v => v.id === id);
  if (idx >= 0) {
    verracos[idx] = { ...verraco, id };
    saveAll(verracos);
    return verracos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteVerraco(id: string) {
  const verracos = getAll().filter(v => v.id !== id);
  saveAll(verracos);
}
