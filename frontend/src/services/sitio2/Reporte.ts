// src/services/sitio2/Reporte.ts
import API_BASE from "../../config/api";

export type ReporteSitio2 = {
  id: number;
  periodo: string;
  ingresos: number;
  bajas: number;
  animales_vendidos: number;
  peso_prom_venta: number;
  porcentaje_mortalidad: number;
  promedio_ganancia_diaria: number;
  ingresos_ventas: number;
  responsable: string;
};

export type NuevoReporteSitio2 = Omit<ReporteSitio2, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToReporte2(api: any): ReporteSitio2 {
  return {
    id: api.id,
    periodo: api.periodo,
    ingresos: api.ingresos,
    bajas: api.bajas,
    animales_vendidos: api.animales_vendidos,
    peso_prom_venta: api.peso_prom_venta,
    porcentaje_mortalidad: api.porcentaje_mortalidad,
    promedio_ganancia_diaria: api.promedio_ganancia_diaria,
    ingresos_ventas: api.ingresos_ventas,
    responsable: api.responsable,
  };
}

export async function getReportesSitio2(): Promise<ReporteSitio2[]> {
  const res = await fetch(
    `${API_BASE}/sitio2/reportes/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener reportes Sitio 2");
  }
  const data = await res.json();
  return data.map(mapApiToReporte2);
}

export async function addReporteSitio2(
  rep: NuevoReporteSitio2
): Promise<ReporteSitio2> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...rep,
  };
  const res = await fetch(`${API_BASE}/sitio2/reportes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear reporte Sitio 2");
  }
  const data = await res.json();
  return mapApiToReporte2(data);
}

export async function updateReporteSitio2(
  id: number,
  rep: NuevoReporteSitio2
): Promise<ReporteSitio2> {
  const res = await fetch(
    `${API_BASE}/sitio2/reportes/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rep),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar reporte Sitio 2");
  }
  const data = await res.json();
  return mapApiToReporte2(data);
}

export async function deleteReporteSitio2(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio2/reportes/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar reporte Sitio 2");
  }
}
