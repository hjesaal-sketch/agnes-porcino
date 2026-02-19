// src/services/animales/Animales.ts
import API_BASE from "../../config/api";

export type ResumenModulo = {
  modulo: string;
  cantidad: number;
};

export type ResumenAnimales = {
  total: number;
  modulos: ResumenModulo[];
};

export async function getResumenAnimales(
  empresaId: number,
  granjaId: number
): Promise<ResumenAnimales> {
  const url = `${API_BASE}/animales/resumen?empresa_id=${empresaId}&granja_id=${granjaId}`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Error al obtener resumen de animales (${res.status}): ${text || "sin detalle"}`
    );
  }

  return res.json();
}
