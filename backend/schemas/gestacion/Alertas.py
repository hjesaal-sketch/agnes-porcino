// src/services/gestacionAlertasService.ts
export type AlertaGestacion = {
  id: string;
  fecha: string;
  tipo: "Sanitaria" | "Reproductiva" | "Bioseguridad" | "Vencimiento" | "Otro";
  nivel: "Crítico" | "Advertencia" | "Informativo";
  descripcion: string;
  responsable: string;
  estado: "Abierta" | "Cerrada";
  acciones: string;
};

const STORAGE_KEY = "gestacion_alertas";

function getAll(): AlertaGestacion[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(alertas: AlertaGestacion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alertas));
}

export function addAlerta(alerta: Omit<AlertaGestacion, "id">) {
  const nueva: AlertaGestacion = { ...alerta, id: crypto.randomUUID() };
  const alertas = getAll();
  alertas.push(nueva);
  saveAll(alertas);
  return nueva;
}

export function updateAlerta(id: string, alerta: Omit<AlertaGestacion, "id">) {
  const alertas = getAll();
  const idx = alertas.findIndex(x => x.id === id);
  if (idx >= 0) {
    alertas[idx] = { ...alerta, id };
    saveAll(alertas);
    return alertas[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteAlerta(id: string) {
  const alertas = getAll().filter(x => x.id !== id);
  saveAll(alertas);
}

export function getAlertas() {
  return getAll();
}
