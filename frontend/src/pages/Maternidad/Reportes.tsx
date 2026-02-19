// src/pages/Maternidad/Reportes.tsx
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
  obtenerResumenMaternidad,
  exportarMaternidadJSON,
  ResumenMaternidad,
} from "../../services/maternidad/Reportes";

export default function MaternidadReportes() {
  const [resumen, setResumen] = useState<ResumenMaternidad | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");

  useEffect(() => {
    (async () => {
      const data = await obtenerResumenMaternidad();
      setResumen(data);
    })();
  }, []);

  const handleExportar = async () => {
    const json = await exportarMaternidadJSON();
    setJsonExport(json);
    setShowDialog(true);
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reportes y Exportes Módulo Maternidad
        </Typography>
        <Button
          variant="outlined"
          sx={{ mb: 2, minWidth: 180 }}
          onClick={handleExportar}
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
          <ul>
            <li>
              Ingresos registrados:{" "}
              <b>{resumen ? resumen.ingresos.length : 0}</b>
            </li>
            <li>
              Partos registrados: <b>{resumen ? resumen.partos.length : 0}</b>
            </li>
            <li>
              Mortalidad y bajas:{" "}
              <b>{resumen ? resumen.mortalidad.length : 0}</b>
            </li>
            <li>
              Controles de lactancia:{" "}
              <b>{resumen ? resumen.lactancia.length : 0}</b>
            </li>
            <li>
              Destetes registrados:{" "}
              <b>{resumen ? resumen.destete.length : 0}</b>
            </li>
            <li>
              Alertas generadas:{" "}
              <b>{resumen ? resumen.alertas.length : 0}</b>
            </li>
          </ul>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Últimos 5 partos
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
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 35 }}>
                <th>Fecha Parto</th>
                <th>ID Madre</th>
                <th>Nac. Vivos</th>
                <th>Nac. Muertos</th>
                <th>Viables</th>
                <th>Peso Total</th>
              </tr>
            </thead>
            <tbody>
              {(resumen?.partos ?? [])
                .slice(-5)
                .reverse()
                .map((p: any) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.fechaParto}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.identificacionMadre}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.nacidosVivos}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.nacidosMuertos}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.lechonesViables}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {p.pesoTotal}
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
          <DialogTitle>
            Exportación JSON de Resumen Maternidad
          </DialogTitle>
          <DialogContent>
            <TextField multiline fullWidth minRows={18} value={jsonExport} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
