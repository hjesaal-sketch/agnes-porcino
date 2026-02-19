// src/services/granja/Reportes.ts
import API_BASE from "../../config/api";
import { ZonaGranja } from "./Infraestructura";
import { InstalacionGranja } from "./Instalaciones";
import { ServicioGranja } from "./Servicios";
import { EquipoGranja } from "./Equipos";
import { PersonalGranja } from "./Personal";
import { Documento } from "./Documentacion";
import { EventoBioseguridad } from "./Bioseguridad";
import { MovimientoEconomico } from "./Economico";
import { EventoEntorno } from "./Entorno";

export type ResumenGranja = {
  zonas: ZonaGranja[];
  instalaciones: InstalacionGranja[];
  servicios: ServicioGranja[];
  equipos: EquipoGranja[];
  personal: PersonalGranja[];
  documentos: Documento[];
  bioseguridad: EventoBioseguridad[];
  economia: MovimientoEconomico[];
  entorno: EventoEntorno[];
};

const EMPRESA_ID = 1;
const GRANJA_ID = 1;

export async function obtenerResumenGranja(): Promise<ResumenGranja> {
  const res = await fetch(
    `${API_BASE}/granja/reportes/resumen?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al obtener resumen de la granja");
  }
  return res.json();
}

export async function exportarGranjaJSON(): Promise<string> {
  const res = await fetch(
    `${API_BASE}/granja/reportes/exportar-json?empresa_id=${EMPRESA_ID}&granja_id=${GRANJA_ID}`
  );
  if (!res.ok) {
    throw new Error("Error al exportar resumen de la granja");
  }
  // Si quieres el string para descargar o mostrar
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}
