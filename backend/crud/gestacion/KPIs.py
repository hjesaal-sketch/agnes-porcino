// src/services/gestacionKPIsService.ts
import { getMadres } from "./gestacionMadresService";
import { getServicios } from "./gestacionServiciosService";
import { getPartos } from "./gestacionPartosService";
import { getHistorial } from "./gestacionHistorialService";

// Puedes ajustar según tu criterio y reglas de negocio
export function getKPIsGestacion() {
  const madres = getMadres();
  const servicios = getServicios();
  const partos = getPartos();
  const historial = getHistorial();

  const totalMadres = madres.length;
  const totalServicios = servicios.length;
  const totalPartos = partos.length;

  const gestantes = servicios.filter(s => s.resultado === "Gestante").length;
  const abortos = historial.filter(h => h.tipoEvento === "Parto" && h.resultado.toLowerCase().includes("aborto")).length;
  const tasaPrenez = totalServicios > 0 ? (gestantes / totalServicios * 100) : 0;
  const eficiencia = totalServicios > 0 ? (totalPartos / totalServicios * 100) : 0;

  return {
    totalMadres,
    totalServicios,
    totalPartos,
    gestantes,
    abortos,
    tasaPrenez: tasaPrenez.toFixed(2),
    eficiencia: eficiencia.toFixed(2),
  };
}
