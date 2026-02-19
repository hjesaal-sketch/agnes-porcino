// src/pages/Sitio2/Reporte.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import {
  getReportesSitio2,
  ReporteSitio2,
} from "../../services/sitio2/Reporte";

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio2Reporte() {
  const [reportes, setReportes] = useState<ReporteSitio2[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("");
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReportesSitio2();
        setReportes(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando reportes de Sitio 2",
          type: "error",
        });
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

  const gmdPromedio = useMemo(
    () =>
      reportesFiltrados.length
        ? (
            reportesFiltrados.reduce(
              (a, b) => a + (b.promedio_ganancia_diaria || 0),
              0
            ) / reportesFiltrados.length
          ).toFixed(2)
        : "0",
    [reportesFiltrados]
  );

  const mortPromedio = useMemo(
    () =>
      reportesFiltrados.length
        ? (
            reportesFiltrados.reduce(
              (a, b) => a + (b.porcentaje_mortalidad || 0),
              0
            ) / reportesFiltrados.length
          ).toFixed(2)
        : "0",
    [reportesFiltrados]
  );

  const totalVendidos = useMemo(
    () =>
      reportesFiltrados.reduce(
        (a, b) => a + (b.animales_vendidos || 0),
        0
      ),
    [reportesFiltrados]
  );

  const totalIngresosVentas = useMemo(
    () =>
      reportesFiltrados.reduce(
        (a, b) => a + (b.ingresos_ventas || 0),
        0
      ),
    [reportesFiltrados]
  );

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dashboard y Reportes – Sitio 2
        </Typography>

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
                    {r.peso_prom_venta.toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.porcentaje_mortalidad.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.promedio_ganancia_diaria.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.ingresos_ventas.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.responsable || "-"}
                  </td>
                </tr>
              ))}
              {!reportesFiltrados.length && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: 12, fontSize: 14 }}
                  >
                    Sin datos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Typography sx={{ mt: 2, fontWeight: 600 }}>
          KPIs Resumidos (indicadores clave de Sitio 2)
        </Typography>
        <Box sx={{ display: "flex", gap: 5, mt: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              GMD Promedio
            </Typography>
            <Typography variant="h6">{gmdPromedio}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              % Mortalidad Total
            </Typography>
            <Typography variant="h6">{mortPromedio}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Animales Vendidos
            </Typography>
            <Typography variant="h6">{totalVendidos}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ingresos por Ventas ($)
            </Typography>
            <Typography variant="h6">
              {totalIngresosVentas.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Snackbar
          open={!!uiAlert}
          autoHideDuration={3200}
          onClose={handleCloseSnackbar}
        >
          {uiAlert ? (
            <MuiAlert
              onClose={handleCloseSnackbar}
              severity={uiAlert.type}
              sx={{ width: "100%" }}
            >
              {uiAlert.msg}
            </MuiAlert>
          ) : undefined}
        </Snackbar>
      </CardContent>
    </Card>
  );
}
