// src/services/geneticaKPIsService.ts
import { getVerracos } from "./geneticaReproductoresService";
import { getValoraciones } from "./geneticaValoracionService";
import { getRegistrosSeminales } from "./geneticaSeminalService";

export function getKPIsGenetica() {
  const verracos = getVerracos();
  const valoraciones = getValoraciones();
  const seminal = getRegistrosSeminales();

  const totalVerracos = verracos.length;
  const activos = verracos.filter(v => v.estadoReproductivo === "Activo").length;
  const enReposo = verracos.filter(v => v.estadoReproductivo === "Reposo").length;
  const baja = verracos.filter(v => v.estadoReproductivo === "Baja").length;

  const totalValoraciones = valoraciones.length;
  const promedioScore = valoraciones.length > 0
    ? (valoraciones.reduce((s, v) => s + (v.score || 0), 0) / valoraciones.length).toFixed(2)
    : "0";

  const totalSeminales = seminal.length;
  const calidadExcelente = seminal.filter(r => r.calidad === "Excelente").length;
  const calidadDeficiente = seminal.filter(r => r.calidad === "Deficiente").length;
  const promedioConcentracion = seminal.length > 0
    ? (seminal.reduce((s, r) => s + (r.concentracion || 0), 0) / seminal.length).toFixed(1)
    : "0";

  return {
    totalVerracos,
    activos,
    enReposo,
    baja,
    totalValoraciones,
    promedioScore,
    totalSeminales,
    calidadExcelente,
    calidadDeficiente,
    promedioConcentracion
  };
}
