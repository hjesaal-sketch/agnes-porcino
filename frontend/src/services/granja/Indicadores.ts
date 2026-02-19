// src/services/granja/Indicadores.ts
import API_BASE from "../../config/api";

export type KPIsGranja = {
  totalInstalaciones: number;
  totalEquipos: number;
  totalServicios: number;
  instalacionesOperativas: number;
  activosOperativos: number;
  totalPersonal: number;
  personalActivo: number;
  totalDocumentos: number;
  totalMovimientos: number;
  serviciosEnMantenimiento: number;
  costosFijos: number;
  costosVariables: number;
  ventas: number;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function getKPIsGranja(): Promise<KPIsGranja> {
  const res = await fetch(
    `${API_BASE}/granja/indicadores/kpis?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener KPIs de la granja");
  }
  return res.json();
}
