// src/services/insumosLimpiezaService.ts
export type ProductoLimpieza = {
  id: string;
  producto: string;
  tipo: "Desinfectante" | "Detergente" | "Insecticida" | "Rodenticida" | "Bioseguridad" | "Otro";
  concentracion: string;
  cantidad: number;
  unidad: string;
  stock: number;
  area: string;
  proveedor: string;
  vencimiento: string;
  observaciones: string;
};

const STORAGE_KEY = "insumos_limpieza";

function getAll(): ProductoLimpieza[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAll(lista: ProductoLimpieza[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function getProductosLimpieza() {
  return getAll();
}

export function addProductoLimpieza(prod: Omit<ProductoLimpieza, "id">) {
  const nuevo: ProductoLimpieza = { ...prod, id: crypto.randomUUID() };
  const productos = getAll();
  productos.push(nuevo);
  saveAll(productos);
  return nuevo;
}

export function updateProductoLimpieza(id: string, prod: Omit<ProductoLimpieza, "id">) {
  const productos = getAll();
  const idx = productos.findIndex(p => p.id === id);
  if (idx >= 0) {
    productos[idx] = { ...prod, id };
    saveAll(productos);
    return productos[idx];
  }
  throw new Error("Registro no encontrado");
}

export function deleteProductoLimpieza(id: string) {
  const productos = getAll().filter(p => p.id !== id);
  saveAll(productos);
}
