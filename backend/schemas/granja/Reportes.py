// src/services/granjaReportesService.ts
import { getZonas } from "./granjaInfraestructuraService";
import { getInstalaciones } from "./granjaInstalacionesService";
import { getServicios } from "./granjaServiciosService";
import { getEquiposGranja } from "./granjaEquiposService";
import { getPersonal } from "./granjaPersonalService";
import { getDocumentos } from "./granjaDocumentacionService";
import { getEventosBioseguridad } from "./granjaBioseguridadService";
import { getMovimientos } from "./granjaEconomicoService";
import { getEventosEntorno } from "./granjaEntornoService";

export function obtenerResumenGranja() {
  return {
    zonas: getZonas(),
    instalaciones: getInstalaciones(),
    servicios: getServicios(),
    equipos: getEquiposGranja(),
    personal: getPersonal(),
    documentos: getDocumentos(),
    bioseguridad: getEventosBioseguridad(),
    economia: getMovimientos(),
    entorno: getEventosEntorno()
  };
}

export function exportarGranjaJSON() {
  return JSON.stringify(obtenerResumenGranja(), null, 2);
}
