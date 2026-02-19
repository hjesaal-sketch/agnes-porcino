// src/services/granjaEntornoService.ts
export type EventoEntorno = {
  id: string;
  fecha: string;
  tipo: "Comunitario" | "Ambiental" | "Geográfico" | "Contexto legal" | "Otro";
  descripcion: string;
  actores: string;
  impacto: "Positivo" | "Negativo" | "Neutro";
  observaciones: string;
};

const STORAGE_KEY = "granja_entorno";

function getAll(): EventoEntorno[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: EventoEntorno[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getEventosEntorno() {
  return getAll();
}

export function addEventoEntorno(evento: Omit<EventoEntorno, "id">) {
  const nuevo: EventoEntorno = { ...evento, id: crypto.randomUUID() };
  const eventos = getAll();
  eventos.push(nuevo);
  saveAll(eventos);
  return nuevo;
}

export function updateEventoEntorno(id: string, evento: Omit<EventoEntorno, "id">) {
  const eventos = getAll();
  const idx = eventos.findIndex(e => e.id === id);
  if (idx >= 0) {
    eventos[idx] = { ...evento, id };
    saveAll(eventos);
    return eventos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteEventoEntorno(id: string) {
  const eventos = getAll().filter(e => e.id !== id);
  saveAll(eventos);
}
