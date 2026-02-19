// frontend/src/services/reportes/Costos.ts
import API_BASE from "../../config/api";

export type CostoIndicador = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  costos_fijos: number;
  costos_variables: number;
  extraordinarios: number;
  total: number;
  responsable: string;
};

export type NuevoCostoIndicador = Omit<
  CostoIndicador,
  "id" | "fecha_inicio" | "fecha_fin"
> & {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): CostoIndicador {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    fecha_inicio: api.fecha_inicio ?? null,
    fecha_fin: api.fecha_fin ?? null,
    costos_fijos: api.costos_fijos,
    costos_variables: api.costos_variables,
    extraordinarios: api.extraordinarios,
    total: api.total,
    responsable: api.responsable,
  };
}

export async function getCostos(
  periodo?: string
): Promise<CostoIndicador[]> {
  const url = new URL(
    `${API_BASE}/reportes/costos/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (periodo) {
    url.searchParams.set("periodo", periodo);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener reporte de costos");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function addCostos(
  payload: Omit<NuevoCostoIndicador, "empresa_id" | "granja_id">
): Promise<CostoIndicador> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/costos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar indicador de costos");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}
