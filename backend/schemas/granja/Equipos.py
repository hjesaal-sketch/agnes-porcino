// src/services/granjaEquiposService.ts
export type EquipoGranja = {
  id: string;
  descripcion: string;
  categoria: "Maquinaria" | "Herramienta" | "Equipo Electrónico" | "Vehículo" | "Otro";
  marca: string;
  modelo: string;
  cantidad: number;
  estado: "Operativo" | "Mantenimiento" | "Baja";
  ubicacion: string;
  responsable: string;
  observaciones: string;
};

const STORAGE_KEY = "granja_equipos";

function getAll(): EquipoGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: EquipoGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getEquiposGranja() {
  return getAll();
}

export function addEquipoGranja(equipo: Omit<EquipoGranja, "id">) {
  const nuevo: EquipoGranja = { ...equipo, id: crypto.randomUUID() };
  const equipos = getAll();
  equipos.push(nuevo);
  saveAll(equipos);
  return nuevo;
}

export function updateEquipoGranja(id: string, equipo: Omit<EquipoGranja, "id">) {
  const equipos = getAll();
  const idx = equipos.findIndex(e => e.id === id);
  if (idx >= 0) {
    equipos[idx] = { ...equipo, id };
    saveAll(equipos);
    return equipos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteEquipoGranja(id: string) {
  const equipos = getAll().filter(e => e.id !== id);
  saveAll(equipos);
}
