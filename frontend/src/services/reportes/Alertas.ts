// frontend/src/services/reportes/Alertas.ts
import API_BASE from "../../config/api";

export type Alerta = {
  id: number;
  empresa_id: number;
  granja_id: number;
  fecha: string;
  tipo: "Sanidad" | "Productividad" | "Bioseguridad" | "Costos" | "Infraestructura" | "Otro";
  nivel: "Crítico" | "Precaución" | "Informativo";
  descripcion: string;
  responsable: string;
  cerrado: boolean;
  acciones: string | null;
  created_at: string;
  updated_at: string;
};

export type NuevaAlerta = Omit<
  Alerta,
  "id" | "created_at" | "updated_at"
>;

export type ActualizarAlerta = Partial<NuevaAlerta>;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToAlerta(api: any): Alerta {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    fecha: api.fecha,
    tipo: api.tipo,
    nivel: api.nivel,
    descripcion: api.descripcion,
    responsable: api.responsable,
    cerrado: api.cerrado,
    acciones: api.acciones ?? null,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export async function getAlertas(
  tipo?: string,
  soloAbiertas?: boolean
): Promise<Alerta[]> {
  const url = new URL(
    `${API_BASE}/reportes/alertas/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (tipo) {
    url.searchParams.set("tipo", tipo);
  }
  if (soloAbiertas) {
    url.searchParams.set("solo_abiertas", "true");
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener alertas");
  }
  const data = await res.json();
  return data.map(mapApiToAlerta);
}

export async function addAlerta(
  payload: Omit<NuevaAlerta, "empresa_id" | "granja_id">
): Promise<Alerta> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/alertas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar alerta");
  }
  const data = await res.json();
  return mapApiToAlerta(data);
}

export async function updateAlerta(
  alertaId: number,
  payload: ActualizarAlerta
): Promise<Alerta> {
  const res = await fetch(`${API_BASE}/reportes/alertas/${alertaId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al actualizar alerta");
  }
  const data = await res.json();
  return mapApiToAlerta(data);
}

export async function getAlertaById(alertaId: number): Promise<Alerta> {
  const res = await fetch(`${API_BASE}/reportes/alertas/${alertaId}`);
  if (!res.ok) {
    throw new Error("Error al obtener alerta");
  }
  const data = await res.json();
  return mapApiToAlerta(data);
}
