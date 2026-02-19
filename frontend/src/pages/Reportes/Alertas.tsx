// frontend/src/pages/Reportes/Alertas.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
} from "@mui/material";
import {
  getAlertas,
  Alerta,
} from "../../services/reportes/Alertas";

type UiAlertState = { msg: string; type: "success" | "error" } | null;

type TipoAlerta = "Sanidad" | "Productividad" | "Bioseguridad" | "Costos" | "Infraestructura" | "Otro";

const tiposAlerta: TipoAlerta[] = [
  "Sanidad",
  "Productividad",
  "Bioseguridad",
  "Costos",
  "Infraestructura",
  "Otro",
];

export default function ReporteAlertas() {
  const [filtro, setFiltro] = useState<string>("");
  const [datos, setDatos] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async (tipo?: string) => {
    try {
      setLoading(true);
      const data = await getAlertas(tipo || undefined);
      setDatos(data);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando alertas",
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
    cargarDatos(filtro || undefined);
  };

  const limpiarFiltro = () => {
    setFiltro("");
    cargarDatos();
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  const filtrados = datos;

  const contador = {
    Crítico: filtrados.filter((a) => a.nivel === "Crítico" && !a.cerrado).length,
    Precaución: filtrados.filter((a) => a.nivel === "Precaución" && !a.cerrado)
      .length,
    Informativo: filtrados.filter((a) => a.nivel === "Informativo" && !a.cerrado)
      .length,
  };

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alertas y Monitoreo de Eventos Críticos
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por Tipo"
            select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            sx={{ maxWidth: 210 }}
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            {tiposAlerta.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </TextField>
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
        <Box sx={{ mb: 2, gap: 2, display: "flex", alignItems: "center" }}>
          <Chip
            color="error"
            label={`Críticas: ${contador.Crítico}`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            color="warning"
            label={`Precauciones: ${contador.Precaución}`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            color="info"
            label={`Informativas: ${contador.Informativo}`}
          />
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
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Descripción</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Acciones/Resolución</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.tipo}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {a.nivel === "Crítico" && (
                      <Chip color="error" label="Crítico" size="small" />
                    )}
                    {a.nivel === "Precaución" && (
                      <Chip color="warning" label="Precaución" size="small" />
                    )}
                    {a.nivel === "Informativo" && (
                      <Chip color="info" label="Info" size="small" />
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.responsable}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {a.cerrado ? (
                      <Chip label="Cerrada" color="success" size="small" />
                    ) : (
                      <Chip label="Abierta" color="error" size="small" />
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.acciones || "-"}
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
                    Sin alertas para el criterio seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        <Typography sx={{ mt: 2, fontWeight: 600 }}>
          Semáforo de alertas en tiempo real, registro de eventos críticos o
          pendientes, y visualización filtrada por área del sistema.
        </Typography>
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
