// src/services/gestacionServiciosService.ts
export type ServicioGestacion = {
  id: string;
  fecha: string;
  identificacionMadre: string;
  tipoServicio: "Natural" | "Inseminación" | "Transferencia Embrionaria";
  verracoId: string;
  resultado: "Pendiente" | "Gestante" | "Vacía";
  observaciones: string;
};

const STORAGE_KEY = "gestacion_servicios";

function getAll(): ServicioGestacion[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(servicios: ServicioGestacion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios));
}

export function addServicio(servicio: Omit<ServicioGestacion, "id">) {
  const nuevo: ServicioGestacion = { ...servicio, id: crypto.randomUUID() };
  const servicios = getAll();
  servicios.push(nuevo);
  saveAll(servicios);
  return nuevo;
}

export function updateServicio(id: string, servicio: Omit<ServicioGestacion, "id">) {
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

export function getServicios() {
  return getAll();
}
