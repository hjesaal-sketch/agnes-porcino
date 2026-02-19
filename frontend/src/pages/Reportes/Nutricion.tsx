// frontend/src/pages/Reportes/Nutricion.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import {
  getNutricion,
  NutricionIndicador,
} from "../../services/reportes/Nutricion";

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function ReporteNutricion() {
  const [filtro, setFiltro] = useState<string>("");
  const [datos, setDatos] = useState<NutricionIndicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async (periodo?: string) => {
    try {
      setLoading(true);
      const data = await getNutricion(periodo);
      setDatos(data);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando reporte nutricional",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const aplicarFiltro = () => {
    const periodo = filtro || undefined;
    cargarDatos(periodo);
  };

  const limpiarFiltro = () => {
    setFiltro("");
    cargarDatos();
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  const filtrados = datos;

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reporte Nutricional: Histórico, Consumo y Eficiencia
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por Periodo"
            type="month"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            sx={{ maxWidth: 200 }}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#169b62" }}
            onClick={aplicarFiltro}
            disabled={loading}
          >
            Aplicar filtro
          </Button>
          <Button
            variant="outlined"
            onClick={limpiarFiltro}
            disabled={loading}
          >
            Mostrar todos
          </Button>
        </Box>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
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
                <th>Consumo Total (kg)</th>
                <th>Consumo x Animal (kg)</th>
                <th>Costo Total ($)</th>
                <th>Costo x Animal ($)</th>
                <th>% Eficiencia</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.periodo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.consumo_total_kg}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.consumo_prom_animal}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.costo_total}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.costo_prom_animal}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.eficiencia}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.responsable}
                  </td>
                </tr>
              ))}
              {!filtrados.length && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 12,
                      fontSize: 14,
                    }}
                  >
                    Sin registros para el criterio seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        <Typography sx={{ mt: 2 }}>Resumen rápido por filtro:</Typography>
        <Box sx={{ display: "flex", gap: 5, mt: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total consumido (kg)
            </Typography>
            <Typography variant="h6">
              {filtrados.reduce((a, b) => a + b.consumo_total_kg, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Costo total ($)
            </Typography>
            <Typography variant="h6">
              {filtrados.reduce((a, b) => a + b.costo_total, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Eficiencia promedio (%)
            </Typography>
            <Typography variant="h6">
              {filtrados.length
                ? (
                    filtrados.reduce((a, b) => a + b.eficiencia, 0) /
                    filtrados.length
                  ).toFixed(2)
                : "0"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
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
    </Card>
  );
}
