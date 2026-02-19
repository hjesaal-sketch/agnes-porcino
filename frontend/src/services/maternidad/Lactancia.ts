// src/services/Lactancia.ts
import API_BASE from "../../config/api";

export type ControlLactancia = {
  id: number;
  fecha: string;
  identificacionMadre: string;
  numeroLechones: number;
  consumoAlimentoKg: number;
  responsable: string;
  observaciones: string;
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

function mapApiToControl(api: any): ControlLactancia {
  return {
    id: api.id,
    fecha: api.fecha,
    identificacionMadre: api.identificacionMadre,
    numeroLechones: api.numeroLechones,
    consumoAlimentoKg: api.consumoAlimentoKg,
    responsable: api.responsable,
    observaciones: api.observaciones ?? "",
  };
}

export async function getControles(): Promise<ControlLactancia[]> {
  const res = await fetch(
    `${API_BASE}/maternidad/lactancia/?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) throw new Error("Error al obtener controles de lactancia");
  const data = await res.json();
  return data.map(mapApiToControl);
}

export type NuevoControlLactancia = Omit<ControlLactancia, "id">;

export async function addControl(
  control: NuevoControlLactancia
): Promise<ControlLactancia> {
  const payload = {
    empresa_id: EMPRESA_ID,
    granja_id: GRANJA_ID,
    fecha: control.fecha,
    identificacionMadre: control.identificacionMadre,
    numeroLechones: control.numeroLechones,
    consumoAlimentoKg: control.consumoAlimentoKg,
    responsable: control.responsable,
    observaciones: control.observaciones,
  };

  const res = await fetch(`${API_BASE}/maternidad/lactancia/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al registrar control de lactancia");
  const data = await res.json();
  return mapApiToControl(data);
}

export async function updateControl(
  id: number,
  control: NuevoControlLactancia
): Promise<ControlLactancia> {
  const payload = {
    fecha: control.fecha,
    identificacionMadre: control.identificacionMadre,
    numeroLechones: control.numeroLechones,
    consumoAlimentoKg: control.consumoAlimentoKg,
    responsable: control.responsable,
    observaciones: control.observaciones,
  };

  const res = await fetch(
    `${API_BASE}/maternidad/lactancia/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar control de lactancia");
  const data = await res.json();
  return mapApiToControl(data);
}

export async function deleteControl(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/maternidad/lactancia/${id}?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Error al eliminar control de lactancia");
}
