// src/services/maternidadIngresoService.ts
export type IngresoMaternidad = {
  id: string;
  fechaIngreso: string;
  identificacionMadre: string;
  lote: string;
  raza: string;
  ageMeses: number;
  motivoIngreso: "Gestación" | "Parto" | "Observación" | "Otro";
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_ingreso";

function getAll(): IngresoMaternidad[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(ingresos: IngresoMaternidad[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ingresos));
}

export function addIngreso(ingreso: Omit<IngresoMaternidad, "id">) {
  const nuevo: IngresoMaternidad = { ...ingreso, id: crypto.randomUUID() };
  const ingresos = getAll();
  ingresos.push(nuevo);
  saveAll(ingresos);
  return nuevo;
}

export function updateIngreso(id: string, ingreso: Omit<IngresoMaternidad, "id">) {
  const ingresos = getAll();
  const idx = ingresos.findIndex(x => x.id === id);
  if (idx >= 0) {
    ingresos[idx] = { ...ingreso, id };
    saveAll(ingresos);
    return ingresos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteIngreso(id: string) {
  const ingresos = getAll().filter(x => x.id !== id);
  saveAll(ingresos);
}

export function getIngresos() {
  return getAll();
}
