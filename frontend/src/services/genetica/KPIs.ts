// src/services/genetica/KPIs.ts
import { getVerracos } from "./Reproductores";
import { getValoraciones } from "./Valoracion";
import { getRegistrosSeminales } from "./Seminal";

export type KPIsGenetica = {
  totalVerracos: number;
  activos: number;
  enReposo: number;
  baja: number;
  totalValoraciones: number;
  promedioScore: string;
  totalSeminales: number;
  calidadExcelente: number;
  calidadDeficiente: number;
  promedioConcentracion: string;
};

export async function getKPIsGenetica(): Promise<KPIsGenetica> {
  const [verracos, valoraciones, seminal] = await Promise.all([
    getVerracos(),
    getValoraciones(),
    getRegistrosSeminales(),
  ]);

  const totalVerracos = verracos.length;
  const activos = verracos.filter((v: any) => v.estadoReproductivo === "Activo").length;
  const enReposo = verracos.filter((v: any) => v.estadoReproductivo === "Reposo").length;
  const baja = verracos.filter((v: any) => v.estadoReproductivo === "Baja").length;

  const totalValoraciones = valoraciones.length;
  const promedioScore =
    valoraciones.length > 0
      ? (
          valoraciones.reduce(
            (s: number, v: any) => s + (v.score || 0),
            0
          ) / valoraciones.length
        ).toFixed(2)
      : "0";

  const totalSeminales = seminal.length;
  const calidadExcelente = seminal.filter((r: any) => r.calidad === "Excelente").length;
  const calidadDeficiente = seminal.filter((r: any) => r.calidad === "Deficiente").length;
  const promedioConcentracion =
    seminal.length > 0
      ? (
          seminal.reduce(
            (s: number, r: any) => s + (r.concentracion || 0),
            0
          ) / seminal.length
        ).toFixed(1)
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
    promedioConcentracion,
  };
}
