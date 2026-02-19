// frontend/src/services/reportes/Productividad.ts
import API_BASE from "../../config/api";

export type ProdIndicador = {
  id: number;
  empresa_id: number;
  granja_id: number;
  periodo: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  animales_activos: number;
  kg_productos: number;
  kg_prom_dia: number;
  eficiencia: number;
  conversion: number;
  responsable: string;
};

export type NuevoProdIndicador = Omit<
  ProdIndicador,
  "id" | "fecha_inicio" | "fecha_fin"
> & {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToIndicador(api: any): ProdIndicador {
  return {
    id: api.id,
    empresa_id: api.empresa_id,
    granja_id: api.granja_id,
    periodo: api.periodo,
    fecha_inicio: api.fecha_inicio ?? null,
    fecha_fin: api.fecha_fin ?? null,
    animales_activos: api.animales_activos,
    kg_productos: api.kg_productos,
    kg_prom_dia: api.kg_prom_dia,
    eficiencia: api.eficiencia,
    conversion: api.conversion,
    responsable: api.responsable,
  };
}

export async function getProductividad(
  periodo?: string
): Promise<ProdIndicador[]> {
  const url = new URL(
    `${API_BASE}/reportes/productividad/`,
    window.location.origin
  );
  url.searchParams.set("empresa_id", String(EMPRESA_ID));
  url.searchParams.set("granja_id", String(GRANJA_ID));
  if (periodo) {
    url.searchParams.set("periodo", periodo);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Error al obtener indicadores de productividad");
  }
  const data = await res.json();
  return data.map(mapApiToIndicador);
}

export async function addProductividad(
  payload: Omit<NuevoProdIndicador, "empresa_id" | "granja_id">
): Promise<ProdIndicador> {
  const body = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...payload,
  };
  const res = await fetch(`${API_BASE}/reportes/productividad/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Error al registrar indicador de productividad");
  }
  const data = await res.json();
  return mapApiToIndicador(data);
}
