// frontend/src/services/reportes/Genetica.ts
import API_BASE from "../../config/api";

export type GeneticaIndicador = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  linea: string;
  animales: number;
  nacimientos: number;
  selectos: number;
  descarte: number;
  progreso_gen: number;
  responsable: string;
};

export type NuevoGeneticaIndicador = Omit<
  GeneticaIndicador,
  "id" | "fecha_inicio" | "fecha_fin"
> & {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): GeneticaIndicador {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    fecha_inicio: api.fecha_inicio ?? null,
    fecha_fin: api.fecha_fin ?? null,
    linea: api.linea,
    animales: api.animales,
    nacimientos: api.nacimientos,
    selectos: api.selectos,
    descarte: api.descarte,
    progreso_gen: api.progreso_gen,
    responsable: api.responsable,
  };
}

export async function getGenetica(
  periodo?: string
): Promise<GeneticaIndicador[]> {
  const url = new URL(
    `${API_BASE}/reportes/genetica/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (periodo) {
    url.searchParams.set("periodo", periodo);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener reporte genético");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function addGenetica(
  payload: Omit<NuevoGeneticaIndicador, "empresa_id" | "granja_id">
): Promise<GeneticaIndicador> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/genetica/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar indicador genético");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}
