// src/pages/Insumos/Reportes.tsx
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
  obtenerResumenInsumos,
  exportarInsumosJSON,
  ResumenInsumos,
} from "../../services/insumos/Reportes";

export default function Reportes() {
  const [resumen, setResumen] = useState<ResumenInsumos | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");

  useEffect(() => {
    (async () => {
      const data = await obtenerResumenInsumos();
      setResumen(data);
    })();
  }, []);

  const handleExportar = async () => {
    const json = await exportarInsumosJSON();
    setJsonExport(json);
    setShowDialog(true);
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1100, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reportes y Exportes de Insumos
        </Typography>

        {resumen && (
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Empresa #{resumen.empresa_id} · Granja #{resumen.granja_id} ·
            generado: {new Date(resumen.generated_at).toLocaleString()}
          </Typography>
        )}

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
              Medicamentos registrados:{" "}
              <b>{resumen ? resumen.medicamentos.length : 0}</b>
            </li>
            <li>
              Productos limpieza: <b>{resumen ? resumen.limpieza.length : 0}</b>
            </li>
            <li>
              Alimentos registrados:{" "}
              <b>{resumen ? resumen.alimentos.length : 0}</b>
            </li>
            <li>
              Insumos generales:{" "}
              <b>{resumen ? resumen.generales.length : 0}</b>
            </li>
            <li>
              Equipos y herramientas:{" "}
              <b>{resumen ? resumen.equipos.length : 0}</b>
            </li>
            <li>
              Registros de costos:{" "}
              <b>{resumen ? resumen.costos.length : 0}</b>
            </li>
          </ul>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
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
              {resumen &&
                Object.entries({
                  medicamentos: resumen.medicamentos,
                  limpieza: resumen.limpieza,
                  alimentos: resumen.alimentos,
                  generales: resumen.generales,
                  equipos: resumen.equipos,
                  costos: resumen.costos,
                }).map(([mod, registros]) => (
                  <tr key={mod} style={{ borderBottom: "1px solid #eee" }}>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "capitalize",
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
                                String(r.fecha) + String(r.descripcion || "")
                              }
                            >
                              {r.descripcion ||
                                r.producto ||
                                r.nombre ||
                                r.tipo ||
                                r.categoria ||
                                r.lote ||
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
          <DialogTitle>Exportación JSON de Insumos</DialogTitle>
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
