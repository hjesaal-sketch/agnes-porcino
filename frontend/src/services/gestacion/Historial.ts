// frontend/src/services/gestacion/Historial.ts
import API_BASE from "../../config/api";

export type TipoEventoHistorial =
  | "Servicio"
  | "Confirmación"
  | "Parto"
  | "Reinserción"
  | "Baja"
  | "Aborto";

export type HistorialGestacion = {
  id: number;
  identificacionMadre: string;
  fechaEvento: string;
  tipoEvento: TipoEventoHistorial;
  resultado: string;
  lote: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToHistorial(api: any): HistorialGestacion {
  return {
    id: api.id,
    identificacionMadre: api.idMadre,
    fechaEvento: api.fecha_evento,
    tipoEvento: api.tipo_evento as TipoEventoHistorial,
    resultado: api.detalle ?? "",
    lote: "",
    observaciones: api.detalle ?? "",
  };
}

export async function getHistorial(): Promise<HistorialGestacion[]> {
  const res = await fetch(
    `${API_BASE}/gestacion/historial?granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener historial");
  const data = await res.json();
  return data.map(mapApiToHistorial);
}

export async function addRegistro(
  registro: Omit<HistorialGestacion, "id">
): Promise<HistorialGestacion> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    idMadre: registro.identificacionMadre,
    tipo_evento: registro.tipoEvento,
    fecha_evento: registro.fechaEvento,
    detalle: registro.observaciones || registro.resultado || "",
    servicio_id: null,
    parto_programado_id: null,
  };

  const res = await fetch(`${API_BASE}/gestacion/historial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Error al registrar evento en historial");
  const data = await res.json();
  return mapApiToHistorial(data);
}

export async function updateRegistro(
  id: string,
  registro: Omit<HistorialGestacion, "id">
): Promise<HistorialGestacion> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    idMadre: registro.identificacionMadre,
    tipo_evento: registro.tipoEvento,
    fecha_evento: registro.fechaEvento,
    detalle: registro.observaciones || registro.resultado || "",
    servicio_id: null,
    parto_programado_id: null,
  };

  const res = await fetch(`${API_BASE}/gestacion/historial/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Error al actualizar historial");
  const data = await res.json();
  return mapApiToHistorial(data);
}

export async function deleteRegistro(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/gestacion/historial/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar historial");
}
