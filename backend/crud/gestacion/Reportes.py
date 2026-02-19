// src/services/gestacionReportesService.ts
import { getMadres } from "./gestacionMadresService";
import { getServicios } from "./gestacionServiciosService";
import { getPartos } from "./gestacionPartosService";
import { getHistorial } from "./gestacionHistorialService";
import { getAlertas } from "./gestacionAlertasService";

export function obtenerResumenGestacion() {
  return {
    madres: getMadres(),
    servicios: getServicios(),
    partos: getPartos(),
    historial: getHistorial(),
    alertas: getAlertas()
  };
}

// Exportación simple a JSON (puedes migrar a Excel/PDF después)
export function exportarGestacionJSON() {
  return JSON.stringify(obtenerResumenGestacion(), null, 2);
}
