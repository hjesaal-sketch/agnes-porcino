// src/services/economico/KPIs.ts
import API_BASE from "../../config/api";

export type KPIsEconomico = {
  totalIngresos: number;
  totalEgresos: number;
  totalCostos: number;
  totalImpuestos: number;
  costosFijos: number;
  costosVariables: number;
  impuestosPendientes: number;
  impuestosPagados: number;
  saldoFinal: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function getKPIsEconomico(): Promise<KPIsEconomico> {
  const res = await fetch(
    `${API_BASE}/economico/kpis?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener KPIs económicos");
  }
  return res.json();
}
