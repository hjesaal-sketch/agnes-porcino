// src/services/granja/Servicios.ts
import API_BASE from "../../config/api";

export type ServicioGranja = {
  id: number;
  tipo: "Agua" | "Electricidad" | "Residuos" | "Gas" | "Internet" | "Otro";
  fuente: string;
  cantidad: number;
  unidad: string;
  fecha: string;
  estado: "Operativo" | "Interrumpido" | "Mantenimiento";
  descripcion: string;
  observaciones: string;
};

export type NuevoServicioGranja = Omit<ServicioGranja, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToServicio(api: any): ServicioGranja {
  return {
    id: api.id,
    tipo: api.tipo,
    fuente: api.fuente,
    cantidad: api.cantidad,
    unidad: api.unidad,
    fecha: api.fecha,
    estado: api.estado,
    descripcion: api.descripcion,
    observaciones: api.observaciones ?? "",
  };
}

export async function getServicios(): Promise<ServicioGranja[]> {
  const res = await fetch(
    `${API_BASE}/granja/servicios/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener servicios de la granja");
  }
  const data = await res.json();
  return data.map(mapApiToServicio);
}

export async function addServicio(
  servicio: NuevoServicioGranja
): Promise<ServicioGranja> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    tipo: servicio.tipo,
    fuente: servicio.fuente,
    cantidad: servicio.cantidad,
    unidad: servicio.unidad,
    fecha: servicio.fecha,
    estado: servicio.estado,
    descripcion: servicio.descripcion,
    observaciones: servicio.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/servicios/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar servicio");
  }
  const data = await res.json();
  return mapApiToServicio(data);
}

export async function updateServicio(
  id: number,
  servicio: NuevoServicioGranja
): Promise<ServicioGranja> {
  const payload = {
    tipo: servicio.tipo,
    fuente: servicio.fuente,
    cantidad: servicio.cantidad,
    unidad: servicio.unidad,
    fecha: servicio.fecha,
    estado: servicio.estado,
    descripcion: servicio.descripcion,
    observaciones: servicio.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/servicios/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar servicio");
  }
  const data = await res.json();
  return mapApiToServicio(data);
}

export async function deleteServicio(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/servicios/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar servicio");
  }
}
