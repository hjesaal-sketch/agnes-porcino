// src/services/insumosEquiposService.ts
export type Equipo = {
  id: string;
  descripcion: string;
  categoria: "Herramienta" | "Equipo mayor" | "Equipo menor" | "Vehículo" | "Otro";
  marca: string;
  modelo: string;
  serie: string;
  cantidad: number;
  unidad: string;
  stock: number;
  ubicacion: string;
  proveedor: string;
  observaciones: string;
};

const STORAGE_KEY = "insumos_equipos";

function getAll(): Equipo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: Equipo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getEquipos() {
  return getAll();
}

export function addEquipo(equipo: Omit<Equipo, "id">) {
  const nuevo: Equipo = { ...equipo, id: crypto.randomUUID() };
  const equipos = getAll();
  equipos.push(nuevo);
  saveAll(equipos);
  return nuevo;
}

export function updateEquipo(id: string, equipo: Omit<Equipo, "id">) {
  const equipos = getAll();
  const idx = equipos.findIndex(e => e.id === id);
  if (idx >= 0) {
    equipos[idx] = { ...equipo, id };
    saveAll(equipos);
    return equipos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteEquipo(id: string) {
  const equipos = getAll().filter(e => e.id !== id);
  saveAll(equipos);
}
