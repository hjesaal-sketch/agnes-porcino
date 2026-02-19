// src/services/economicoEgresosService.ts
export type EgresoEconomico = {
  id: string;
  fecha: string;
  beneficiario: string;
  tipo: "Compra insumos" | "Pago servicios" | "Salarios" | "Otro";
  monto: number;
  responsable: string;
  descripcion: string;
};

const STORAGE_KEY = "economico_egresos";

function getAll(): EgresoEconomico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: EgresoEconomico[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getEgresos() {
  return getAll();
}

export function addEgreso(eg: Omit<EgresoEconomico, "id">) {
  const nuevo: EgresoEconomico = { ...eg, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateEgreso(id: string, eg: Omit<EgresoEconomico, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(e => e.id === id);
  if (idx >= 0) {
    lista[idx] = { ...eg, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteEgreso(id: string) {
  const lista = getAll().filter(e => e.id !== id);
  saveAll(lista);
}
