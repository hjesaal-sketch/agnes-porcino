// src/pages/Gestacion/Reportes.tsx
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
  obtenerResumenGestacion,
  exportarGestacionJSON,
} from "../../services/gestacion/Reportes";
import { MadreGestante } from "../../services/gestacion/Madres";
import { ServicioGestacion } from "../../services/gestacion/Servicios";
import { PartoProgramado } from "../../services/gestacion/PartosProgramados";
import { HistorialGestacion } from "../../services/gestacion/Historial";
import { AlertaGestacion } from "../../services/gestacion/Alertas";

type ResumenResuelto = {
  madres: MadreGestante[];
  servicios: ServicioGestacion[];
  partos: PartoProgramado[];
  historial: HistorialGestacion[];
  alertas: AlertaGestacion[];
};

export default function GestacionReportes() {
  const [resumen, setResumen] = useState<ResumenResuelto | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");

  useEffect(() => {
    (async () => {
      // obtenerResumenGestacion devuelve un objeto con promesas en cada campo
      const raw = obtenerResumenGestacion();
      const [madres, servicios, partos, historial, alertas] = await Promise.all([
        raw.madres,
        raw.servicios,
        raw.partos,
        raw.historial,
        raw.alertas,
      ]);
      setResumen({ madres, servicios, partos, historial, alertas });
    })();
  }, []);

  const handleExportar = () => {
    setJsonExport(exportarGestacionJSON());
    setShowDialog(true);
  };

  if (!resumen) {
    return (
      <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
        <CardContent>
          <Typography>Cargando resumen de gestación...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reportes y Exportes del Módulo de Gestación
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
              Madres registradas: <b>{resumen.madres.length}</b>
            </li>
            <li>
              Servicios/inseminaciones: <b>{resumen.servicios.length}</b>
            </li>
            <li>
              Partos programados/realizados: <b>{resumen.partos.length}</b>
            </li>
            <li>
              Eventos historial: <b>{resumen.historial.length}</b>
            </li>
            <li>
              Alertas: <b>{resumen.alertas.length}</b>
            </li>
          </ul>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Últimas 5 madres
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
                <th>Fecha Ingreso</th>
                <th>ID</th>
                <th>Raza</th>
                <th>Lote</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {resumen.madres
                .slice(-5)
                .reverse()
                .map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {m.fechaIngreso}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {m.identificacion}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {m.raza}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {m.lote}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13 }}>
                      {m.estado}
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
          <DialogTitle>Exportación JSON de Resumen Gestación</DialogTitle>
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
