// src/pages/Economico/Reportes.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  obtenerResumenEconomico,
  exportarEconomicoJSON,
  ResumenEconomico,
} from "../../services/economico/Reportes";

export default function EconomicoReportes() {
  const [resumen, setResumen] = useState<ResumenEconomico | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await obtenerResumenEconomico();
        setResumen(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExportar = async () => {
    try {
      const data = await exportarEconomicoJSON();
      setJsonExport(data);
      setShowDialog(true);
    } catch (e) {
      console.error(e);
    }
  };

  const resumenSafe = resumen ?? {
    ingresos: [],
    egresos: [],
    costos: [],
    impuestos: [],
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reporte y Exportación Económica
        </Typography>
        <Button
          variant="outlined"
          sx={{ mb: 2, minWidth: 180 }}
          onClick={handleExportar}
          disabled={loading}
        >
          Exportar toda la data (JSON)
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, mb: 1, fontWeight: 700 }}
          >
            Resumen General:
          </Typography>
          {loading && <Typography variant="body2">Cargando...</Typography>}
          {!loading && (
            <ul>
              <li>
                Ingresos registrados: <b>{resumenSafe.ingresos.length}</b>
              </li>
              <li>
                Egresos registrados: <b>{resumenSafe.egresos.length}</b>
              </li>
              <li>
                Costos registrados: <b>{resumenSafe.costos.length}</b>
              </li>
              <li>
                Impuestos registrados: <b>{resumenSafe.impuestos.length}</b>
              </li>
            </ul>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Últimos 3 movimientos por módulo
          </Typography>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              marginBottom: 24,
              boxShadow: "0 1px 8px #0001",
              borderRadius: 10,
              overflow: "hidden",
              tableLayout: "auto",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 35 }}>
                <th>Módulo</th>
                <th>Detalle (últimos 3)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resumenSafe).map(([mod, registros]) => (
                <tr key={mod} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {mod}
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {[...(registros as any[])]
                        .slice(-3)
                        .reverse()
                        .map((r: any) => (
                          <li
                            key={
                              r.id ||
                              String(r.fecha) + String(r.descripcion || "")
                            }
                          >
                            {r.descripcion ||
                              r.fuente ||
                              r.concepto ||
                              r.tipo ||
                              r.beneficiario ||
                              "—"}
                          </li>
                        ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Dialog
          open={showDialog}
          maxWidth="md"
          fullWidth
          onClose={() => setShowDialog(false)}
        >
          <DialogTitle>Exportación JSON de Finanzas</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              fullWidth
              minRows={18}
              value={jsonExport}
              InputProps={{ readOnly: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
