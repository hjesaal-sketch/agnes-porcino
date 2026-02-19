// frontend/src/pages/Reportes/Productividad.tsx
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
  getProductividad,
  ProdIndicador,
} from "../../services/reportes/Productividad";

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function ReporteProductividad() {
  const [filtro, setFiltro] = useState<string>("");
  const [datos, setDatos] = useState<ProdIndicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async (periodo?: string) => {
    try {
      setLoading(true);
      const data = await getProductividad(periodo);
      setDatos(data);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando indicadores de productividad",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(); // carga inicial sin filtro
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

  const filtrados = datos; // ya vienen filtrados desde backend

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Indicadores de Productividad: Histórico, Evolución y Comparativos
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
                <th>Animales Activos</th>
                <th>Kg Productos</th>
                <th>Kg Prom. Día</th>
                <th>% Eficiencia</th>
                <th>Conv. Alim.</th>
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
                    {f.animales_activos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.kg_productos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.kg_prom_dia}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.eficiencia}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {f.conversion}
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
              Animales promedio
            </Typography>
            <Typography variant="h6">
              {filtrados.length
                ? (
                    filtrados.reduce(
                      (a, b) => a + b.animales_activos,
                      0
                    ) / filtrados.length
                  ).toFixed(0)
                : "0"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Kg totales productos
            </Typography>
            <Typography variant="h6">
              {filtrados.reduce((a, b) => a + b.kg_productos, 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Eficiencia Promedio (%)
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
          <Box>
            <Typography variant="body2" color="text.secondary">
              Conv. Alim. Prom.
            </Typography>
            <Typography variant="h6">
              {filtrados.length
                ? (
                    filtrados.reduce((a, b) => a + b.conversion, 0) /
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
