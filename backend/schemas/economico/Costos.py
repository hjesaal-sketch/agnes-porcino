// src/services/economicoCostosService.ts
export type CostoEconomico = {
  id: string;
  fecha: string;
  categoria: "Fijo" | "Variable" | "Indirecto" | "Otro";
  concepto: string;
  monto: number;
  responsable: string;
  descripcion: string;
};

const STORAGE_KEY = "economico_costos";

function getAll(): CostoEconomico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: CostoEconomico[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getCostos() {
  return getAll();
}

export function addCosto(c: Omit<CostoEconomico, "id">) {
  const nuevo: CostoEconomico = { ...c, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateCosto(id: string, c: Omit<CostoEconomico, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(x => x.id === id);
  if (idx >= 0) {
    lista[idx] = { ...c, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteCosto(id: string) {
  const lista = getAll().filter(x => x.id !== id);
  saveAll(lista);
}
