// src/services/gestacionHistorialService.ts
export type HistorialGestacion = {
  id: string;
  identificacionMadre: string;
  fechaEvento: string;
  tipoEvento: "Servicio" | "Confirmación" | "Parto" | "Reinserción" | "Baja";
  resultado: string;
  lote: string;
  observaciones: string;
};

const STORAGE_KEY = "gestacion_historial";

function getAll(): HistorialGestacion[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(historial: HistorialGestacion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
}

export function addRegistro(registro: Omit<HistorialGestacion, "id">) {
  const nuevo: HistorialGestacion = { ...registro, id: crypto.randomUUID() };
  const historial = getAll();
  historial.push(nuevo);
  saveAll(historial);
  return nuevo;
}

export function updateRegistro(id: string, registro: Omit<HistorialGestacion, "id">) {
  const historial = getAll();
  const idx = historial.findIndex(x => x.id === id);
  if (idx >= 0) {
    historial[idx] = { ...registro, id };
    saveAll(historial);
    return historial[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteRegistro(id: string) {
  const historial = getAll().filter(x => x.id !== id);
  saveAll(historial);
}

export function getHistorial() {
  return getAll();
}
