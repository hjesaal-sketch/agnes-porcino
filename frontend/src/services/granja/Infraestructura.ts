// src/services/granja/Infraestructura.ts
import API_BASE from "../../config/api";

export type ZonaGranja = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: "Productiva" | "Administrativa" | "Servicios" | "Biodiversidad" | "Otro";
  ubicacionGPS: string; // "lat,lon"
  areaM2: number;
  observaciones: string;
};

export type NuevaZonaGranja = Omit<ZonaGranja, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToZona(api: any): ZonaGranja {
  return {
    id: api.id,
    nombre: api.nombre,
    descripcion: api.descripcion,
    tipo: api.tipo,
    ubicacionGPS: api.ubicacionGPS,
    areaM2: api.areaM2,
    observaciones: api.observaciones ?? "",
  };
}

export async function getZonas(): Promise<ZonaGranja[]> {
  const res = await fetch(
    `${API_BASE}/granja/infraestructura/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener zonas de la granja");
  }
  const data = await res.json();
  return data.map(mapApiToZona);
}

export async function addZona(zona: NuevaZonaGranja): Promise<ZonaGranja> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    nombre: zona.nombre,
    descripcion: zona.descripcion,
    tipo: zona.tipo,
    ubicacionGPS: zona.ubicacionGPS,
    areaM2: zona.areaM2,
    observaciones: zona.observaciones,
  };

  const res = await fetch(`${API_BASE}/granja/infraestructura/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al registrar zona");
  }
  const data = await res.json();
  return mapApiToZona(data);
}

export async function updateZona(
  id: number,
  zona: NuevaZonaGranja
): Promise<ZonaGranja> {
  const payload = {
    nombre: zona.nombre,
    descripcion: zona.descripcion,
    tipo: zona.tipo,
    ubicacionGPS: zona.ubicacionGPS,
    areaM2: zona.areaM2,
    observaciones: zona.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/granja/infraestructura/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar zona");
  }
  const data = await res.json();
  return mapApiToZona(data);
}

export async function deleteZona(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/granja/infraestructura/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar zona");
  }
}
