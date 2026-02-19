// src/services/economicoKPIsService.ts
import { getIngresos } from "./economicoIngresosService";
import { getEgresos } from "./economicoEgresosService";
import { getCostos } from "./economicoCostosService";
import { getImpuestos } from "./economicoImpuestosService";

export function getKPIsEconomico() {
  const ingresos = getIngresos();
  const egresos = getEgresos();
  const costos = getCostos();
  const impuestos = getImpuestos();

  const totalIngresos = ingresos.reduce((sum, i) => sum + (i.monto || 0), 0);
  const totalEgresos = egresos.reduce((sum, e) => sum + (e.monto || 0), 0);
  const totalCostos = costos.reduce((sum, c) => sum + (c.monto || 0), 0);
  const totalImpuestos = impuestos.reduce((sum, i) => sum + (i.monto || 0), 0);

  const costosFijos = costos.filter(c => c.categoria === "Fijo").reduce((sum, c) => sum + (c.monto || 0), 0);
  const costosVariables = costos.filter(c => c.categoria === "Variable").reduce((sum, c) => sum + (c.monto || 0), 0);

  const impuestosPendientes = impuestos.filter(i => !i.pagado).length;
  const impuestosPagados = impuestos.filter(i => i.pagado).length;

  const saldoFinal = totalIngresos - totalEgresos - totalCostos - totalImpuestos;

  return {
    totalIngresos,
    totalEgresos,
    totalCostos,
    totalImpuestos,
    costosFijos,
    costosVariables,
    impuestosPendientes,
    impuestosPagados,
    saldoFinal
  };
}
