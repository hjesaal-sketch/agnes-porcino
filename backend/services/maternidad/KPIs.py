// src/services/maternidadKPIsService.ts
import { getIngresos } from "./maternidadIngresoService";
import { getPartos } from "./maternidadPartosService";
import { getControles } from "./maternidadLactanciaService";
import { getRegistrosMortalidad } from "./maternidadMortandadService";
import { getRegistrosDestete } from "./maternidadDesteteService";

export function getKPIsMaternidad() {
  const ingresos = getIngresos();
  const partos = getPartos();
  const lactancia = getControles();
  const mortalidad = getRegistrosMortalidad();
  const destete = getRegistrosDestete();

  const totalMadres = ingresos.length;
  const totalPartos = partos.length;
  const totalLechonesVivos = partos.reduce((sum,p)=>sum+p.nacidosVivos,0);
  const totalLechonesMuertos = partos.reduce((sum,p)=>sum+p.nacidosMuertos,0);
  const totalDestetados = destete.reduce((sum,d)=>sum+d.lechonesDestetados,0);

  const mortalidadLechones = mortalidad.filter(m=>m.tipo==="Lechón").reduce((sum,m)=>sum+m.cantidad,0);
  const mortalidadMadres = mortalidad.filter(m=>m.tipo==="Madre").reduce((sum,m)=>sum+m.cantidad,0);

  const promedioLechonesVivos = totalPartos>0 ? (totalLechonesVivos/totalPartos).toFixed(2) : "0";
  const promedioDestetados = destete.length>0 ? (totalDestetados/destete.length).toFixed(2) : "0";
  const tasaMortalidadLechones = totalLechonesVivos>0 ? (mortalidadLechones/totalLechonesVivos*100).toFixed(2) : "0";

  return {
    totalMadres,
    totalPartos,
    totalLechonesVivos,
    totalLechonesMuertos,
    mortalidadLechones,
    mortalidadMadres,
    promedioLechonesVivos,
    promedioDestetados,
    tasaMortalidadLechones,
    totalDestetados
  };
}
