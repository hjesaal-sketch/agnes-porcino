// src/services/granjaServiciosService.ts
export type ServicioGranja = {
  id: string;
  tipo: "Agua" | "Electricidad" | "Residuos" | "Gas" | "Internet" | "Otro";
  fuente: string;
  cantidad: number;
  unidad: string;
  fecha: string;
  estado: "Operativo" | "Interrumpido" | "Mantenimiento";
  descripcion: string;
  observaciones: string;
};

const STORAGE_KEY = "granja_servicios";

function getAll(): ServicioGranja[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: ServicioGranja[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getServicios() {
  return getAll();
}

export function addServicio(servicio: Omit<ServicioGranja, "id">) {
  const nuevo: ServicioGranja = { ...servicio, id: crypto.randomUUID() };
  const servicios = getAll();
  servicios.push(nuevo);
  saveAll(servicios);
  return nuevo;
}

export function updateServicio(id: string, servicio: Omit<ServicioGranja, "id">) {
  const servicios = getAll();
  const idx = servicios.findIndex(s => s.id === id);
  if (idx >= 0) {
    servicios[idx] = { ...servicio, id };
    saveAll(servicios);
    return servicios[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteServicio(id: string) {
  const servicios = getAll().filter(s => s.id !== id);
  saveAll(servicios);
}
