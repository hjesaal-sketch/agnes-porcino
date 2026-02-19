// src/services/insumosMedicamentosService.ts
export type Medicamento = {
  id: string;
  nombre: string;
  principio: string;
  lote: string;
  vencimiento: string;
  laboratorio: string;
  tipo: "Vacuna" | "Antibiótico" | "Antiparasitario" | "Desinfectante" | "Otro";
  condiciones: string;
  proveedor: string;
  stock: number;
  unidad: string;
  observaciones: string;
};

const STORAGE_KEY = "insumos_medicamentos";

function getAll(): Medicamento[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: Medicamento[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getMedicamentos() {
  return getAll();
}

export function addMedicamento(med: Omit<Medicamento, "id">) {
  const nuevo: Medicamento = { ...med, id: crypto.randomUUID() };
  const medicamentos = getAll();
  medicamentos.push(nuevo);
  saveAll(medicamentos);
  return nuevo;
}

export function updateMedicamento(id: string, med: Omit<Medicamento, "id">) {
  const medicamentos = getAll();
  const idx = medicamentos.findIndex(m => m.id === id);
  if (idx >= 0) {
    medicamentos[idx] = { ...med, id };
    saveAll(medicamentos);
    return medicamentos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteMedicamento(id: string) {
  const medicamentos = getAll().filter(m => m.id !== id);
  saveAll(medicamentos);
}
