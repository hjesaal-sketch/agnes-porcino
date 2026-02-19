// src/services/maternidadSaludService.ts
export type SaludMaternidad = {
  id: string;
  fecha: string;
  identificacionMadre: string;
  tipoPaciente: "Madre" | "Lechones";
  evento: "Vacunación" | "Tratamiento" | "Revisión" | "Muestra" | "Otro";
  descripcion: string;
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_salud";

function getAll(): SaludMaternidad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(registros: SaludMaternidad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

export function addSalud(registro: Omit<SaludMaternidad, "id">) {
  const nuevo: SaludMaternidad = { ...registro, id: crypto.randomUUID() };
  const registros = getAll();
  registros.push(nuevo);
  saveAll(registros);
  return nuevo;
}

export function updateSalud(id: string, registro: Omit<SaludMaternidad, "id">) {
  const registros = getAll();
  const idx = registros.findIndex(x => x.id === id);
  if (idx >= 0) {
    registros[idx] = { ...registro, id };
    saveAll(registros);
    return registros[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteSalud(id: string) {
  const registros = getAll().filter(x => x.id !== id);
  saveAll(registros);
}

export function getRegistrosSalud() {
  return getAll();
}
