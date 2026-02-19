// src/pages/Sitio3/Reporte.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import {
  getReportesSitio3,
  ReporteSitio3,
} from "../../services/sitio3/Reporte";

export default function Sitio3Reporte() {
  const [reportes, setReportes] = useState<ReporteSitio3[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReportesSitio3();
        setReportes(data);
      } catch (e: any) {
        setErrorMsg(e.message || "Error cargando reportes Sitio 3");
      }
    })();
  }, []);

  const reportesFiltrados = useMemo(
    () =>
      periodoFiltro
        ? reportes.filter((r) => r.periodo === periodoFiltro)
        : reportes,
    [reportes, periodoFiltro]
  );

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dashboard e Indicadores Económicos – Sitio 3
        </Typography>

        {errorMsg && (
          <Typography color="error" sx={{ mb: 1 }}>
            {errorMsg}
          </Typography>
        )}

        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Filtrar por Periodo"
            type="month"
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
            sx={{ maxWidth: 200 }}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#169b62" }}
            onClick={() => setPeriodoFiltro("")}
          >
            Mostrar Todos
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} disabled>
            Exportar PDF (próximamente)
          </Button>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto", mb: 2 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              marginBottom: 24,
              boxShadow: "0 1px 8px #0001",
              borderRadius: 10,
              overflow: "hidden",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 41 }}>
                <th>Periodo</th>
                <th>Ingresos</th>
                <th>Bajas Totales</th>
                <th>Vendidos</th>
                <th>Peso Prom. Venta</th>
                <th>% Mortalidad</th>
                <th>GMD (kg/día)</th>
                <th>Ingresos Ventas ($)</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.periodo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.ingresos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.bajas}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.animales_vendidos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.peso_prom_venta}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.porcentaje_mortalidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.promedio_ganancia_diaria}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.ingresos_ventas}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.responsable}
                  </td>
                </tr>
              ))}
              {!reportesFiltrados.length && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: 12, fontSize: 14 }}
                  >
                    Sin reportes para el periodo seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Typography sx={{ mt: 2, fontWeight: 600 }}>
          KPIs Resumidos – Sitio 3
        </Typography>
        <Box sx={{ display: "flex", gap: 5, mt: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              GMD Promedio
            </Typography>
            <Typography variant="h6">
              {reportesFiltrados.length
                ? (
                    reportesFiltrados.reduce(
                      (a, b) => a + b.promedio_ganancia_diaria,
                      0
                    ) / reportesFiltrados.length
                  ).toFixed(2)
                : "0"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              % Mortalidad Total
            </Typography>
            <Typography variant="h6">
              {reportesFiltrados.length
                ? (
                    reportesFiltrados.reduce(
                      (a, b) => a + b.porcentaje_mortalidad,
                      0
                    ) / reportesFiltrados.length
                  ).toFixed(2)
                : "0"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ingresos por Ventas ($)
            </Typography>
            <Typography variant="h6">
              {reportesFiltrados.reduce(
                (a, b) => a + b.ingresos_ventas,
                0
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Animales Vendidos
            </Typography>
            <Typography variant="h6">
              {reportesFiltrados.reduce(
                (a, b) => a + b.animales_vendidos,
                0
              )}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
