// src/services/insumosCostosService.ts
export type CostoInsumo = {
  id: string;
  fecha: string;
  categoria: "Medicamento/Vacuna" | "Alimento" | "Equipo/Herramienta" | "Limpieza" | "Suministro General";
  presupuesto: number;
  real: number;
  variacion: number;
  comentarios: string;
};

const STORAGE_KEY = "insumos_costos";

function getAll(): CostoInsumo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: CostoInsumo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getCostos() {
  return getAll();
}

export function addCosto(costo: Omit<CostoInsumo, "id"|"variacion">) {
  const variacion = costo.real - costo.presupuesto;
  const nuevo: CostoInsumo = { ...costo, id: crypto.randomUUID(), variacion };
  const costos = getAll();
  costos.push(nuevo);
  saveAll(costos);
  return nuevo;
}

export function updateCosto(id: string, costo: Omit<CostoInsumo, "id"|"variacion">) {
  const costos = getAll();
  const idx = costos.findIndex(c => c.id === id);
  if (idx >= 0) {
    const variacion = costo.real - costo.presupuesto;
    costos[idx] = { ...costo, id, variacion };
    saveAll(costos);
    return costos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteCosto(id: string) {
  const costos = getAll().filter(c => c.id !== id);
  saveAll(costos);
}
