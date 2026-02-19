// src/services/economicoIngresosService.ts
export type IngresoEconomico = {
  id: string;
  fecha: string;
  fuente: string;
  tipo: "Venta producción" | "Subvención" | "Préstamo" | "Otro";
  monto: number;
  responsable: string;
  descripcion: string;
};

const STORAGE_KEY = "economico_ingresos";

function getAll(): IngresoEconomico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: IngresoEconomico[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getIngresos() {
  return getAll();
}

export function addIngreso(ing: Omit<IngresoEconomico, "id">) {
  const nuevo: IngresoEconomico = { ...ing, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateIngreso(id: string, ing: Omit<IngresoEconomico, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(i => i.id === id);
  if (idx >= 0) {
    lista[idx] = { ...ing, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteIngreso(id: string) {
  const lista = getAll().filter(i => i.id !== id);
  saveAll(lista);
}
