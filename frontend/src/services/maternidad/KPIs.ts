// src/services/maternidad/KPIs.ts
import API_BASE from "../../config/api";

export type KPIsMaternidad = {
  totalMadres: number;
  totalPartos: number;
  totalLechonesVivos: number;
  totalLechonesMuertos: number;
  mortalidadLechones: number;
  mortalidadMadres: number;
  promedioLechonesVivos: string;
  promedioDestetados: string;
  tasaMortalidadLechones: string;
  totalDestetados: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function getKPIsMaternidad(): Promise<KPIsMaternidad> {
  const res = await fetch(
    `${API_BASE}/maternidad/kpis/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener KPIs de maternidad");
  }
  const data = await res.json();
  return data as KPIsMaternidad;
}
