// frontend/src/services/reportes/Nutricion.ts
import API_BASE from "../../config/api";

export type NutricionIndicador = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  consumo_total_kg: number;
  consumo_prom_animal: number;
  costo_total: number;
  costo_prom_animal: number;
  eficiencia: number;
  responsable: string;
};

export type NuevoNutricionIndicador = Omit<
  NutricionIndicador,
  "id" | "fecha_inicio" | "fecha_fin"
> & {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): NutricionIndicador {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    fecha_inicio: api.fecha_inicio ?? null,
    fecha_fin: api.fecha_fin ?? null,
    consumo_total_kg: api.consumo_total_kg,
    consumo_prom_animal: api.consumo_prom_animal,
    costo_total: api.costo_total,
    costo_prom_animal: api.costo_prom_animal,
    eficiencia: api.eficiencia,
    responsable: api.responsable,
  };
}

export async function getNutricion(
  periodo?: string
): Promise<NutricionIndicador[]> {
  const url = new URL(
    `${API_BASE}/reportes/nutricion/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (periodo) {
    url.searchParams.set("periodo", periodo);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener reporte nutricional");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function addNutricion(
  payload: Omit<NuevoNutricionIndicador, "empresa_id" | "granja_id">
): Promise<NutricionIndicador> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/nutricion/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar indicador nutricional");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}
