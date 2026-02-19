// src/pages/Granja/Reportes.tsx
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
  obtenerResumenGranja,
  exportarGranjaJSON,
  ResumenGranja,
} from "../../services/granja/Reportes";

export default function Reportes() {
  const [resumen, setResumen] = useState<ResumenGranja | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [jsonExport, setJsonExport] = useState("");

  useEffect(() => {
    (async () => {
      const data = await obtenerResumenGranja();
      setResumen(data);
    })();
  }, []);

  const handleExportar = async () => {
    const json = await exportarGranjaJSON();
    setJsonExport(json);
    setShowDialog(true);
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1100, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reportes y Exportes Generales de Granja
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
              Zonas mapeadas: <b>{resumen ? resumen.zonas.length : 0}</b>
            </li>
            <li>
              Instalaciones registradas:{" "}
              <b>{resumen ? resumen.instalaciones.length : 0}</b>
            </li>
            <li>
              Servicios registrados:{" "}
              <b>{resumen ? resumen.servicios.length : 0}</b>
            </li>
            <li>
              Equipos/activos:{" "}
              <b>{resumen ? resumen.equipos.length : 0}</b>
            </li>
            <li>
              Personal: <b>{resumen ? resumen.personal.length : 0}</b>
            </li>
            <li>
              Documentos:{" "}
              <b>{resumen ? resumen.documentos.length : 0}</b>
            </li>
            <li>
              Eventos de bioseguridad:{" "}
              <b>{resumen ? resumen.bioseguridad.length : 0}</b>
            </li>
            <li>
              Movimientos económicos:{" "}
              <b>{resumen ? resumen.economia.length : 0}</b>
            </li>
            <li>
              Eventos de entorno:{" "}
              <b>{resumen ? resumen.entorno.length : 0}</b>
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
                Object.entries(resumen).map(([mod, registros]) => (
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
                                r.nombre ||
                                r.tipo ||
                                r.categoria ||
                                r.estado ||
                                r.actores ||
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
          <DialogTitle>Exportación JSON de Resumen Granja</DialogTitle>
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
