//src/services/sitio3/Kpis.ts
import API_BASE from "../../config/api";

export type KpiRow = {
  lote: string;
  animales_ingresados: number;
  mortalidad: number;
  mortalidad_pct: number;
  adg_est: number | null;
  fcr_est: number | null;
  dias_en_sitio: number | null;
  kg_vendidos: number;
  ingreso_bruto: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function getKpisSitio3(): Promise<KpiRow[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/kpis/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener KPIs Sitio 3");
  }
  const data = await res.json();
  return data as KpiRow[];
}
