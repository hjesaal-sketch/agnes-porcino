// src/services/granjaEconomicoService.ts
export type MovimientoEconomico = {
  id: string;
  fecha: string;
  tipo: "Costo fijo" | "Costo variable" | "Venta" | "Otro";
  descripcion: string;
  categoria: string;
  monto: number;
  responsable: string;
  comentarios: string;
};

const STORAGE_KEY = "granja_economico";

function getAll(): MovimientoEconomico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: MovimientoEconomico[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getMovimientos() {
  return getAll();
}

export function addMovimiento(mov: Omit<MovimientoEconomico, "id">) {
  const nuevo: MovimientoEconomico = { ...mov, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateMovimiento(id: string, mov: Omit<MovimientoEconomico, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(m => m.id === id);
  if (idx >= 0) {
    lista[idx] = { ...mov, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteMovimiento(id: string) {
  const lista = getAll().filter(m => m.id !== id);
  saveAll(lista);
}
