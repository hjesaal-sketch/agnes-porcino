// src/services/granjaBioseguridadService.ts
export type EventoBioseguridad = {
  id: string;
  fecha: string;
  tipo: "Ingreso personas" | "Mov. animales" | "Desinfección" | "Contingencia" | "Auditoría" | "Otro";
  descripcion: string;
  responsable: string;
  acciones: string;
  estado: "Resuelto" | "Pendiente" | "Crítico";
  observaciones: string;
};

const STORAGE_KEY = "granja_bioseguridad";

function getAll(): EventoBioseguridad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: EventoBioseguridad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getEventosBioseguridad() {
  return getAll();
}

export function addEventoBioseguridad(evento: Omit<EventoBioseguridad, "id">) {
  const nuevo: EventoBioseguridad = { ...evento, id: crypto.randomUUID() };
  const eventos = getAll();
  eventos.push(nuevo);
  saveAll(eventos);
  return nuevo;
}

export function updateEventoBioseguridad(id: string, evento: Omit<EventoBioseguridad, "id">) {
  const eventos = getAll();
  const idx = eventos.findIndex(e => e.id === id);
  if (idx >= 0) {
    eventos[idx] = { ...evento, id };
    saveAll(eventos);
    return eventos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteEventoBioseguridad(id: string) {
  const eventos = getAll().filter(e => e.id !== id);
  saveAll(eventos);
}
