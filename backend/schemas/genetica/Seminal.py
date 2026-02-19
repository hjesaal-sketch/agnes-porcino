// src/services/geneticaSeminalService.ts
export type RegistroSeminal = {
  id: string;
  fecha: string;
  identificacion: string;
  raza: string;
  volumen: number;
  concentracion: number;
  motilidad: string;
  calidad: "Excelente" | "Buena" | "Regular" | "Deficiente";
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "genetica_seminal";

function getAll(): RegistroSeminal[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: RegistroSeminal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getRegistrosSeminales() {
  return getAll();
}

export function addRegistroSeminal(reg: Omit<RegistroSeminal, "id">) {
  const nuevo: RegistroSeminal = { ...reg, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateRegistroSeminal(id: string, reg: Omit<RegistroSeminal, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(x => x.id === id);
  if (idx >= 0) {
    lista[idx] = { ...reg, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteRegistroSeminal(id: string) {
  const lista = getAll().filter(x => x.id !== id);
  saveAll(lista);
}
