// src/services/gestacion/Servicios.ts

import API_BASE from "../../config/api";

export type SubServicioGestacion = {
  numero: number;
  fecha: string; // ISO (YYYY-MM-DD)
  verracoId: string;
  inseminador: string;
};

export type ServicioGestacion = {
  id: number; // ahora viene de la BD
  fecha: string;
  identificacionMadre: string;
  tipoServicio: "Natural" | "Inseminación" | "Transferencia Embrionaria";
  verracoId: string;
  resultado: "Pendiente" | "Gestante" | "Vacía" | "Aborto";
  observaciones: string;
  subServicios: SubServicioGestacion[];
};

const GRANJA_ID = 1;

function mapApiToServicio(api: any): ServicioGestacion {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacionMadre: api.identificacionMadre,
    tipoServicio: api.tipoServicio,
    verracoId: api.verracoId,
    resultado: api.resultado,
    observaciones: api.observaciones ?? "",
    subServicios: (api.subServicios || []).map((ss: any) => ({
      numero: ss.numero,
      fecha: ss.fecha,
      verracoId: ss.verracoId,
      inseminador: ss.inseminador,
    })),
  };
}

// direction:
//   - "desc" (default): más nuevos primero
//   - "asc": más antiguos primero
export async function getServicios(
  direction: "asc" | "desc" = "desc"
): Promise<ServicioGestacion[]> {
  const res = await fetch(
    `${API_BASE}/gestacion/servicios?granja_id=${GRANJA_ID}&direction=${direction}`
  );
  if (!res.ok) throw new Error("Error al obtener servicios");
  const data = await res.json();
  return data.map(mapApiToServicio);
}

export async function addServicio(
  servicio: Omit<ServicioGestacion, "id">
): Promise<ServicioGestacion> {
  const payload = {
    fecha: servicio.fecha,
    identificacionMadre: servicio.identificacionMadre,
    tipoServicio: servicio.tipoServicio,
    verracoId: servicio.verracoId,
    resultado: servicio.resultado,
    observaciones: servicio.observaciones,
    subServicios: servicio.subServicios.map((ss) => ({
      numero: ss.numero,
      fecha: ss.fecha,
      verracoId: ss.verracoId,
      inseminador: ss.inseminador,
    })),
  };

  const res = await fetch(
    `${API_BASE}/gestacion/servicios?granja_id=${GRANJA_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Error al crear servicio");
  const data = await res.json();
  return mapApiToServicio(data);
}

export async function updateServicio(
  id: number,
  servicio: Omit<ServicioGestacion, "id">
): Promise<ServicioGestacion> {
  const payload = {
    fecha: servicio.fecha,
    tipoServicio: servicio.tipoServicio,
    verracoId: servicio.verracoId,
    resultado: servicio.resultado,
    observaciones: servicio.observaciones,
    subServicios: servicio.subServicios.map((ss) => ({
      numero: ss.numero,
      fecha: ss.fecha,
      verracoId: ss.verracoId,
      inseminador: ss.inseminador,
    })),
  };

  const res = await fetch(
    `${API_BASE}/gestacion/servicios/${id}?granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Error al actualizar servicio");
  const data = await res.json();
  return mapApiToServicio(data);
}

export async function deleteServicio(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/gestacion/servicios/${id}?granja_id=${GRANJA_ID}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Error al eliminar servicio");
}
