// src/services/geneticaValoracionService.ts
export type ValoracionGenetica = {
  id: string;
  fecha: string;
  identificacion: string;
  raza: string;
  resultado: string;
  prueba: "Indice Genético" | "Test ADN" | "Morfología" | "Sanidad" | "Otro";
  evaluador: string;
  score: number;
  observaciones: string;
};

const STORAGE_KEY = "genetica_valoracion";

function getAll(): ValoracionGenetica[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(list: ValoracionGenetica[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getValoraciones() {
  return getAll();
}

export function addValoracion(v: Omit<ValoracionGenetica, "id">) {
  const nueva: ValoracionGenetica = { ...v, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nueva);
  saveAll(lista);
  return nueva;
}

export function updateValoracion(id: string, v: Omit<ValoracionGenetica, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(x => x.id === id);
  if (idx >= 0) {
    lista[idx] = { ...v, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteValoracion(id: string) {
  const lista = getAll().filter(x => x.id !== id);
  saveAll(lista);
}
