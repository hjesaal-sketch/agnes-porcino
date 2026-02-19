//src/services/sitio3/Reporte.ts
import API_BASE from "../../config/api";

export type ReporteSitio3 = {
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

export type NuevoReporteSitio3 = Omit<ReporteSitio3, "id">;

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToReporte3(api: any): ReporteSitio3 {
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

export async function getReportesSitio3(): Promise<ReporteSitio3[]> {
  const res = await fetch(
    `${API_BASE}/sitio3/reportes/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener reportes Sitio 3");
  }
  const data = await res.json();
  return data.map(mapApiToReporte3);
}

export async function addReporteSitio3(
  rep: NuevoReporteSitio3
): Promise<ReporteSitio3> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    ...rep,
  };
  const res = await fetch(`${API_BASE}/sitio3/reportes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Error al crear reporte Sitio 3");
  }
  const data = await res.json();
  return mapApiToReporte3(data);
}

export async function updateReporteSitio3(
  id: number,
  rep: NuevoReporteSitio3
): Promise<ReporteSitio3> {
  const res = await fetch(
    `${API_BASE}/sitio3/reportes/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rep),
    }
  );
  if (!res.ok) {
    throw new Error("Error al actualizar reporte Sitio 3");
  }
  const data = await res.json();
  return mapApiToReporte3(data);
}

export async function deleteReporteSitio3(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/sitio3/reportes/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Error al eliminar reporte Sitio 3");
  }
}
