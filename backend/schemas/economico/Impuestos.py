// src/services/economicoImpuestosService.ts
export type ImpuestoEconomico = {
  id: string;
  fecha: string;
  tipo: "IVA" | "ISLR" | "Arancel" | "Otro";
  monto: number;
  descripcion: string;
  pagado: boolean;
  vencimiento: string;
  responsable: string;
};

const STORAGE_KEY = "economico_impuestos";

function getAll(): ImpuestoEconomico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: ImpuestoEconomico[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getImpuestos() {
  return getAll();
}

export function addImpuesto(i: Omit<ImpuestoEconomico, "id">) {
  const nuevo: ImpuestoEconomico = { ...i, id: crypto.randomUUID() };
  const lista = getAll();
  lista.push(nuevo);
  saveAll(lista);
  return nuevo;
}

export function updateImpuesto(id: string, i: Omit<ImpuestoEconomico, "id">) {
  const lista = getAll();
  const idx = lista.findIndex(x => x.id === id);
  if (idx >= 0) {
    lista[idx] = { ...i, id };
    saveAll(lista);
    return lista[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteImpuesto(id: string) {
  const lista = getAll().filter(x => x.id !== id);
  saveAll(lista);
}
