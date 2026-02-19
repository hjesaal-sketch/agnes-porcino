// src/pages/Genetica/Reportes.tsx
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
  obtenerResumenGenetica,
  exportarGeneticaJSON,
  ResumenGenetica, // si lo exportas desde el service, mejor usarlo directo
} from "../../services/genetica/Reportes";

// Si el servicio no exporta el tipo, descomenta esto:
// type ResumenGenetica = Awaited<ReturnType<typeof obtenerResumenGenetica>>;

export default function GeneticaReportes() {
  const [resumen, setResumen] = useState<ResumenGenetica | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerResumenGenetica();
        setResumen(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleExportar = async () => {
    try {
      const json = await exportarGeneticaJSON();
      setJsonExport(json);
      setShowDialog(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reportes y Exportes de Genética
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
              Reproductores registrados:{" "}
              <b>{resumen ? resumen.reproductores.length : 0}</b>
            </li>
            <li>
              Valoraciones genéticas:{" "}
              <b>{resumen ? resumen.valoraciones.length : 0}</b>
            </li>
            <li>
              Registros seminales:{" "}
              <b>{resumen ? resumen.seminal.length : 0}</b>
            </li>
          </ul>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Últimos 3 registros por módulo
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
              {resumen &&
                (["reproductores", "valoraciones", "seminal"] as const).map(
                  (mod) => {
                    const registros = resumen[mod] as any[];
                    return (
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
                            {[...registros]
                              .slice(-3)
                              .reverse()
                              .map((r: any) => (
                                <li
                                  key={
                                    r.id ||
                                    String(r.fecha) +
                                      String(r.identificacion || "")
                                  }
                                >
                                  {r.identificacion ||
                                    r.resultado ||
                                    r.descripcion ||
                                    r.raza ||
                                    r.prueba ||
                                    "—"}
                                </li>
                              ))}
                          </ul>
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        </Box>

        <Dialog
          open={showDialog}
          maxWidth="md"
          fullWidth
          onClose={() => setShowDialog(false)}
        >
          <DialogTitle>Exportación JSON de Genética</DialogTitle>
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
