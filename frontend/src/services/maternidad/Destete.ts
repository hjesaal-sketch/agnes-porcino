// src/services/maternidad/Destete.ts
import API_BASE from "../../config/api";

export type DesteteMaternidad = {
  id: number;
  empresa_id?: number;
  granja_id?: number;
  fecha: string;
  identificacionMadre: string;
  lechonesDestetados: number;
  pesoTotalKg: number;
  destino: "Sitio 2" | "Sitio 3" | "Venta" | "Otro";
  responsable: string;
  observaciones: string;
  created_at?: string;
  updated_at?: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToDestete(api: any): DesteteMaternidad {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    fecha: api.fecha,
    identificacionMadre: api.identificacion_madre || api.identificacionMadre,
    lechonesDestetados: api.lechones_destetados || api.lechonesDestetados,
    pesoTotalKg: api.peso_total_kg || api.pesoTotalKg,
    destino: api.destino,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export async function getRegistrosDestete(): Promise<DesteteMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/destete/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener registros de destete");
  const data = await res.json();
  return data.map(mapApiToDestete);
}

export type NuevoDesteteMaternidad = Omit<DesteteMaternidad, "id" | "empresa_id" | "granja_id" | "created_at" | "updated_at">;

export async function addDestete(
  registro: NuevoDesteteMaternidad
): Promise<DesteteMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    lechonesDestetados: registro.lechonesDestetados,
    pesoTotalKg: registro.pesoTotalKg,
    destino: registro.destino,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/destete/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar destete");
  const data = await res.json();
  return mapApiToDestete(data);
}

export async function updateDestete(
  id: number,
  registro: NuevoDesteteMaternidad
): Promise<DesteteMaternidad> {
  const payload = {
    fecha: registro.fecha,
    identificacionMadre: registro.identificacionMadre,
    lechonesDestetados: registro.lechonesDestetados,
    pesoTotalKg: registro.pesoTotalKg,
    destino: registro.destino,
    responsable: registro.responsable,
    observaciones: registro.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/destete/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar destete");
  const data = await res.json();
  return mapApiToDestete(data);
}

export async function deleteDestete(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/destete/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar destete");
}
