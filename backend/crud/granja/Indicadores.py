// src/services/granjaIndicadoresService.ts
import { getInstalaciones } from "./granjaInstalacionesService";
import { getEquiposGranja } from "./granjaEquiposService";
import { getServicios } from "./granjaServiciosService";
import { getPersonal } from "./granjaPersonalService";
import { getMovimientos } from "./granjaEconomicoService";
import { getDocumentos } from "./granjaDocumentacionService";

export function getKPIsGranja() {
  const instalaciones = getInstalaciones();
  const equipos = getEquiposGranja();
  const servicios = getServicios();
  const personal = getPersonal();
  const movimientos = getMovimientos();
  const documentos = getDocumentos();

  const totalInstalaciones = instalaciones.length;
  const totalEquipos = equipos.length;
  const totalServicios = servicios.length;
  const totalPersonal = personal.length;
  const totalMovimientos = movimientos.length;
  const totalDocumentos = documentos.length;

  const activosOperativos = equipos.filter(e => e.estado === "Operativo").length;
  const instalacionesOperativas = instalaciones.filter(i => i.estado === "Operativa").length;
  const personalActivo = personal.filter(p => p.estado === "Activo").length;
  const serviciosEnMantenimiento = servicios.filter(s => s.estado === "Mantenimiento").length;

  // KPIs financieros básicos
  const costosFijos = movimientos.filter(m => m.tipo === "Costo fijo").reduce((sum, m) => sum + m.monto, 0);
  const costosVariables = movimientos.filter(m => m.tipo === "Costo variable").reduce((sum, m) => sum + m.monto, 0);
  const ventas = movimientos.filter(m => m.tipo === "Venta").reduce((sum, m) => sum + m.monto, 0);

  return {
    totalInstalaciones,
    totalEquipos,
    totalServicios,
    instalacionesOperativas,
    activosOperativos,
    totalPersonal,
    personalActivo,
    totalDocumentos,
    totalMovimientos,
    serviciosEnMantenimiento,
    costosFijos,
    costosVariables,
    ventas
  };
}
