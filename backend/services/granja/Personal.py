// src/services/granjaPersonalService.ts
export type PersonalGranja = {
  id: string;
  nombre: string;
  cargo: string;
  turno: "Mañana" | "Tarde" | "Noche" | "Rotativo";
  capacitaciones: string;
  fechaIngreso: string;
  estado: "Activo" | "Suspendido" | "Baja";
  contacto: string;
  organigrama: string; // Ej: "Supervisor", "Operario", etc.
  observaciones: string;
};

const STORAGE_KEY = "granja_personal";

function getAll(): PersonalGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(personal: PersonalGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personal));
}

export function getPersonal() {
  return getAll();
}

export function addPersonal(pers: Omit<PersonalGranja, "id">) {
  const nuevo: PersonalGranja = { ...pers, id: crypto.randomUUID() };
  const personal = getAll();
  personal.push(nuevo);
  saveAll(personal);
  return nuevo;
}

export function updatePersonal(id: string, pers: Omit<PersonalGranja, "id">) {
  const personal = getAll();
  const idx = personal.findIndex(p => p.id === id);
  if (idx >= 0) {
    personal[idx] = { ...pers, id };
    saveAll(personal);
    return personal[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deletePersonal(id: string) {
  const personal = getAll().filter(p => p.id !== id);
  saveAll(personal);
}
