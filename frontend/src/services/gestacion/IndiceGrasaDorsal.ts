// src/services/gestacion/IndiceGrasaDorsal.ts

import API_BASE from "../../config/api";

const GRANJA_ID = 1;

export type EtapaBackfat = "gestacion" | "lactancia" | "reposo" | "reemplazo";

export type MedicionIGDorsal = {
  id: number;
  empresa_id: number;
  granja_id: number;
  sow_id: number;
  fecha_medicion: string; // ISO (YYYY-MM-DD)
  valor_mm: number;
  equipo: string;
  usuario: string;
  etapa: EtapaBackfat;
  observaciones: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type NuevaMedicionIGDorsal = {
  empresa_id: number;
  sow_id: number;
  fecha_medicion: string; // ISO (YYYY-MM-DD)
  valor_mm: number;
  equipo?: string;
  usuario?: string;
  etapa: EtapaBackfat;
  observaciones?: string;
};

/**
 * Mapear respuesta cruda de API a tipo de frontend.
 * De momento no transformamos mucho, pero queda centralizado por si luego
 * quieres adaptar nombres/formatos.
 */
function mapApiToMedicion(api: any): MedicionIGDorsal {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    sow_id: api.sow_id,
    fecha_medicion: api.fecha_medicion,
    valor_mm: api.valor_mm,
    equipo: api.equipo ?? "",
    usuario: api.usuario ?? "",
    etapa: api.etapa,
    observaciones: api.observaciones ?? null,
    activo: api.activo,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

/**
 * Listar mediciones con filtros generales.
 * Filtros:
 * - empresa_id (obligatorio)
 * - granja_id (interno: GRANJA_ID)
 * - sow_id (opcional)
 * - fecha_desde / fecha_hasta (opcional)
 * - etapa (opcional)
 */
export async function getMedicionesIGDorsal(params: {
  empresaId: number;
  sowId?: number;
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
  etapa?: EtapaBackfat;
}): Promise<MedicionIGDorsal[]> {
  const searchParams = new URLSearchParams();

  searchParams.set("empresa_id", String(params.empresaId));
  searchParams.set("granja_id", String(GRANJA_ID));

  if (params.sowId != null) {
    searchParams.set("sow_id", String(params.sowId));
  }
  if (params.fechaDesde) {
    searchParams.set("fecha_desde", params.fechaDesde);
  }
  if (params.fechaHasta) {
    searchParams.set("fecha_hasta", params.fechaHasta);
  }
  if (params.etapa) {
    searchParams.set("etapa", params.etapa);
  }

  const res = await fetch(
    `${API_BASE}/condicion-corporal/mediciones?${searchParams.toString()}`
  );

  if (!res.ok) {
    throw new Error("Error al obtener mediciones de I. G. Dorsal");
  }

  const data = await res.json();
  return (data as any[]).map(mapApiToMedicion);
}

/**
 * Listar mediciones por cerda específica (atajo para el endpoint /cerda/{sow_id}).
 */
export async function getMedicionesIGDorsalPorCerda(params: {
  empresaId: number;
  sowId: number;
  etapa?: EtapaBackfat;
}): Promise<MedicionIGDorsal[]> {
  const searchParams = new URLSearchParams();

  searchParams.set("empresa_id", String(params.empresaId));
  searchParams.set("granja_id", String(GRANJA_ID));
  if (params.etapa) {
    searchParams.set("etapa", params.etapa);
  }

  const res = await fetch(
    `${API_BASE}/condicion-corporal/mediciones/cerda/${params.sowId}?${searchParams.toString()}`
  );

  if (!res.ok) {
    throw new Error("Error al obtener mediciones de I. G. Dorsal por cerda");
  }

  const data = await res.json();
  return (data as any[]).map(mapApiToMedicion);
}

/**
 * Registrar nueva medición de I. G. Dorsal.
 */
export async function addMedicionIGDorsal(
  medicion: NuevaMedicionIGDorsal
): Promise<MedicionIGDorsal> {
  const payload = {
    empresa_id: medicion.empresa_id,
    granja_id: GRANJA_ID,
    sow_id: medicion.sow_id,
    fecha_medicion: medicion.fecha_medicion,
    valor_mm: medicion.valor_mm,
    equipo: medicion.equipo ?? "",
    usuario: medicion.usuario ?? "",
    etapa: medicion.etapa,
    observaciones: medicion.observaciones ?? "",
  };

  const res = await fetch(`${API_BASE}/condicion-corporal/mediciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(
      msg || "Error al registrar medición de I. G. Dorsal"
    );
  }

  const data = await res.json();
  return mapApiToMedicion(data);
}

/**
 * Actualizar medición existente de I. G. Dorsal.
 */
export async function updateMedicionIGDorsal(
  id: number,
  medicion: Partial<NuevaMedicionIGDorsal> & { empresa_id: number }
): Promise<MedicionIGDorsal> {
  const payload: any = {};

  if (medicion.fecha_medicion) payload.fecha_medicion = medicion.fecha_medicion;
  if (medicion.valor_mm != null) payload.valor_mm = medicion.valor_mm;
  if (medicion.equipo != null) payload.equipo = medicion.equipo;
  if (medicion.usuario != null) payload.usuario = medicion.usuario;
  if (medicion.etapa != null) payload.etapa = medicion.etapa;
  if (medicion.observaciones != null)
    payload.observaciones = medicion.observaciones;

  const searchParams = new URLSearchParams();
  searchParams.set("empresa_id", String(medicion.empresa_id));
  searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(
    `${API_BASE}/condicion-corporal/mediciones/${id}?${searchParams.toString()}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(
      msg || "Error al actualizar medición de I. G. Dorsal"
    );
  }

  const data = await res.json();
  return mapApiToMedicion(data);
}

/**
 * Eliminar (borrado lógico) medición de I. G. Dorsal.
 */
export async function deleteMedicionIGDorsal(params: {
  id: number;
  empresaId: number;
}): Promise<void> {
  const searchParams = new URLSearchParams();
  searchParams.set("empresa_id", String(params.empresaId));
  searchParams.set("granja_id", String(GRANJA_ID));

  const res = await fetch(
    `${API_BASE}/condicion-corporal/mediciones/${params.id}?${searchParams.toString()}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(
      msg || "Error al eliminar medición de I. G. Dorsal"
    );
  }
}
