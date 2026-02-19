// src/services/Reportes.ts
import { getMadres } from "./Madres";
import { getServicios } from "./Servicios";
import { getPartos } from "./PartosProgramados";
import { getHistorial } from "./Historial";
import { getAlertas } from "./Alertas";

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
