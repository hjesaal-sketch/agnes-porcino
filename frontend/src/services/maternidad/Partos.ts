// src/services/Partos.ts
import API_BASE from "../../config/api";

export type PartoMaternidad = {
  id: number;
  fechaParto: string;
  identificacionMadre: string;
  nacidosVivos: number;
  nacidosMuertos: number;
  lechonesViables: number;
  pesoTotal: number;
  responsable: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToParto(api: any): PartoMaternidad {
  return {
    id: api.id,
    fechaParto: api.fechaParto,
    identificacionMadre: api.identificacionMadre,
    nacidosVivos: api.nacidosVivos,
    nacidosMuertos: api.nacidosMuertos,
    lechonesViables: api.lechonesViables,
    pesoTotal: api.pesoTotal,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getPartos(): Promise<PartoMaternidad[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/partos/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener partos de maternidad");
  const data = await res.json();
  return data.map(mapApiToParto);
}

export type NuevoPartoMaternidad = Omit<PartoMaternidad, "id">;

export async function addParto(
  parto: NuevoPartoMaternidad
): Promise<PartoMaternidad> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fechaParto: parto.fechaParto,
    identificacionMadre: parto.identificacionMadre,
    nacidosVivos: parto.nacidosVivos,
    nacidosMuertos: parto.nacidosMuertos,
    lechonesViables: parto.lechonesViables,
    pesoTotal: parto.pesoTotal,
    responsable: parto.responsable,
    observaciones: parto.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/partos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar parto de maternidad");
  const data = await res.json();
  return mapApiToParto(data);
}

export async function updateParto(
  id: number,
  parto: NuevoPartoMaternidad
): Promise<PartoMaternidad> {
  const payload = {
    fechaParto: parto.fechaParto,
    identificacionMadre: parto.identificacionMadre,
    nacidosVivos: parto.nacidosVivos,
    nacidosMuertos: parto.nacidosMuertos,
    lechonesViables: parto.lechonesViables,
    pesoTotal: parto.pesoTotal,
    responsable: parto.responsable,
    observaciones: parto.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/partos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar parto de maternidad");
  const data = await res.json();
  return mapApiToParto(data);
}

export async function deleteParto(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/partos/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar parto de maternidad");
}
