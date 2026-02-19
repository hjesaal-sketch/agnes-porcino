// src/services/maternidadLactanciaService.ts
export type ControlLactancia = {
  id: string;
  fecha: string;
  identificacionMadre: string;
  numeroLechones: number;
  consumoAlimentoKg: number;
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "maternidad_lactancia";

function getAll(): ControlLactancia[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(controles: ControlLactancia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(controles));
}

export function addControl(control: Omit<ControlLactancia, "id">) {
  const nuevo: ControlLactancia = { ...control, id: crypto.randomUUID() };
  const controles = getAll();
  controles.push(nuevo);
  saveAll(controles);
  return nuevo;
}

export function updateControl(id: string, control: Omit<ControlLactancia, "id">) {
  const controles = getAll();
  const idx = controles.findIndex(x => x.id === id);
  if (idx >= 0) {
    controles[idx] = { ...control, id };
    saveAll(controles);
    return controles[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteControl(id: string) {
  const controles = getAll().filter(x => x.id !== id);
  saveAll(controles);
}

export function getControles() {
  return getAll();
}
