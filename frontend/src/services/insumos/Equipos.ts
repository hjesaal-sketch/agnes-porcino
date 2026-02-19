// src/services/insumos/Equipos.ts
import API_BASE from "../../config/api";

export type Equipo = {
  id: number;
  descripcion: string;
  categoria: "Herramienta" | "Equipo mayor" | "Equipo menor" | "Vehículo" | "Otro";
  marca: string;
  modelo: string;
  serie: string;
  cantidad: number;
  unidad: string;
  stock: number;
  ubicacion: string;
  proveedor: string;
  observaciones: string;
};

export type NuevoEquipo = Omit<Equipo, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToEquipo(api: any): Equipo {
  return {
    id: api.id,
    descripcion: api.descripcion,
    categoria: api.categoria,
    marca: api.marca ?? "",
    modelo: api.modelo ?? "",
    serie: api.serie ?? "",
    cantidad: api.cantidad,
    unidad: api.unidad,
    stock: api.stock,
    ubicacion: api.ubicacion ?? "",
    proveedor: api.proveedor ?? "",
    observaciones: api.observaciones ?? "",
  };
}

export async function getEquipos(): Promise<Equipo[]> {
  const res = await fetch(
    `${API_BASE}/insumos/equipos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener equipos");
  }
  const data = await res.json();
  return data.map(mapApiToEquipo);
}

export async function addEquipo(equipo: NuevoEquipo): Promise<Equipo> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    descripcion: equipo.descripcion,
    categoria: equipo.categoria,
    marca: equipo.marca,
    modelo: equipo.modelo,
    serie: equipo.serie,
    cantidad: equipo.cantidad,
    unidad: equipo.unidad,
    stock: equipo.stock,
    ubicacion: equipo.ubicacion,
    proveedor: equipo.proveedor,
    observaciones: equipo.observaciones,
  };

  const res = await fetch(`${API_BASE}/insumos/equipos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al agregar equipo");
  }
  const data = await res.json();
  return mapApiToEquipo(data);
}

export async function updateEquipo(
  id: number,
  equipo: NuevoEquipo
): Promise<Equipo> {
  const payload = {
    descripcion: equipo.descripcion,
    categoria: equipo.categoria,
    marca: equipo.marca,
    modelo: equipo.modelo,
    serie: equipo.serie,
    cantidad: equipo.cantidad,
    unidad: equipo.unidad,
    stock: equipo.stock,
    ubicacion: equipo.ubicacion,
    proveedor: equipo.proveedor,
    observaciones: equipo.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/insumos/equipos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar equipo");
  }
  const data = await res.json();
  return mapApiToEquipo(data);
}

export async function deleteEquipo(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/insumos/equipos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar equipo");
  }
}
