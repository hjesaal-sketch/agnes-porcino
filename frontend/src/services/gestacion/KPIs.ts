// src/services/gestacion/KPIs.ts
import { getMadres, MadreGestante } from "./Madres";
import { getServicios, ServicioGestacion } from "./Servicios";
import { getPartos, PartoProgramado } from "./PartosProgramados";
import { getHistorial, HistorialGestacion } from "./Historial";

// Puedes ajustar según tu criterio y reglas de negocio
export async function getKPIsGestacion() {
  const [madres, servicios, partos, historial]: [
    MadreGestante[],
    ServicioGestacion[],
    PartoProgramado[],
    HistorialGestacion[]
  ] = await Promise.all([
    getMadres(),
    getServicios(),
    getPartos(),
    getHistorial(),
  ]);

  const totalMadres = madres.length;
  const totalServicios = servicios.length;
  const totalPartos = partos.length;

  const gestantes = servicios.filter(
    (s) => s.resultado === "Gestante"
  ).length;

  const abortos = historial.filter(
    (h) =>
      h.tipoEvento === "Parto" &&
      h.resultado.toLowerCase().includes("aborto")
  ).length;

  const tasaPrenez =
    totalServicios > 0 ? (gestantes / totalServicios) * 100 : 0;
  const eficiencia =
    totalServicios > 0 ? (totalPartos / totalServicios) * 100 : 0;

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
