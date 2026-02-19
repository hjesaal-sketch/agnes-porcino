// src/services/maternidadDesteteService.ts
export type DesteteMaternidad = {
  id: string;
  fecha: string;
  identificacionMadre: string;
  lechonesDestetados: number;
  pesoTotalKg: number;
  destino: "Engorde" | "Venta" | "Reposición" | "Otro";
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_destete";

function getAll(): DesteteMaternidad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(registros: DesteteMaternidad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

export function addDestete(registro: Omit<DesteteMaternidad, "id">) {
  const nuevo: DesteteMaternidad = { ...registro, id: crypto.randomUUID() };
  const registros = getAll();
  registros.push(nuevo);
  saveAll(registros);
  return nuevo;
}

export function updateDestete(id: string, registro: Omit<DesteteMaternidad, "id">) {
  const registros = getAll();
  const idx = registros.findIndex(x => x.id === id);
  if (idx >= 0) {
    registros[idx] = { ...registro, id };
    saveAll(registros);
    return registros[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteDestete(id: string) {
  const registros = getAll().filter(x => x.id !== id);
  saveAll(registros);
}

export function getRegistrosDestete() {
  return getAll();
}
