// src/services/insumos/Limpieza.ts
import API_BASE from "../../config/api";

export type ProductoLimpieza = {
  id: number;
  producto: string;
  tipo:
    | "Desinfectante"
    | "Detergente"
    | "Insecticida"
    | "Rodenticida"
    | "Bioseguridad"
    | "Otro";
  concentracion: string;
  cantidad: number;
  unidad: string;
  stock: number;
  area: string;
  proveedor: string;
  vencimiento: string;
  observaciones: string;
};

export type NuevoProductoLimpieza = Omit<ProductoLimpieza, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToProducto(api: any): ProductoLimpieza {
  return {
    id: api.id,
    producto: api.producto,
    tipo: api.tipo,
    concentracion: api.concentracion ?? "",
    cantidad: api.cantidad,
    unidad: api.unidad,
    stock: api.stock,
    area: api.area ?? "",
    proveedor: api.proveedor ?? "",
    vencimiento: api.vencimiento ?? "",
    observaciones: api.observaciones ?? "",
  };
}

export async function getProductosLimpieza(): Promise<ProductoLimpieza[]> {
  const res = await fetch(
    `${API_BASE}/insumos/limpieza/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener productos de limpieza");
  }
  const data = await res.json();
  return data.map(mapApiToProducto);
}

export async function addProductoLimpieza(
  prod: NuevoProductoLimpieza
): Promise<ProductoLimpieza> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    producto: prod.producto,
    tipo: prod.tipo,
    concentracion: prod.concentracion,
    cantidad: prod.cantidad,
    unidad: prod.unidad,
    stock: prod.stock,
    area: prod.area,
    proveedor: prod.proveedor,
    vencimiento: prod.vencimiento || null,
    observaciones: prod.observaciones,
  };

  const res = await fetch(`${API_BASE}/insumos/limpieza/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al agregar producto de limpieza");
  }
  const data = await res.json();
  return mapApiToProducto(data);
}

export async function updateProductoLimpieza(
  id: number,
  prod: NuevoProductoLimpieza
): Promise<ProductoLimpieza> {
  const payload = {
    producto: prod.producto,
    tipo: prod.tipo,
    concentracion: prod.concentracion,
    cantidad: prod.cantidad,
    unidad: prod.unidad,
    stock: prod.stock,
    area: prod.area,
    proveedor: prod.proveedor,
    vencimiento: prod.vencimiento || null,
    observaciones: prod.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/insumos/limpieza/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar producto de limpieza");
  }
  const data = await res.json();
  return mapApiToProducto(data);
}

export async function deleteProductoLimpieza(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/limpieza/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar producto de limpieza");
  }
}
