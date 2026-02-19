// src/pages/Granja/Infraestructura.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
} from "@mui/material";
import {
  getZonas,
  addZona,
  updateZona,
  deleteZona,
  ZonaGranja,
  NuevaZonaGranja,
} from "../../services/granja/Infraestructura";

const tipoOptions = [
  "Productiva",
  "Administrativa",
  "Servicios",
  "Biodiversidad",
  "Otro",
] as const;

const emptyForm: NuevaZonaGranja = {
  nombre: "",
  descripcion: "",
  tipo: "Productiva",
  ubicacionGPS: "",
  areaM2: 0,
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Infraestructura() {
  const [zonas, setZonas] = useState<ZonaGranja[]>([]);
  const [form, setForm] = useState<NuevaZonaGranja>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getZonas();
      setZonas(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.nombre || !form.tipo || form.areaM2 < 1) {
        setUiAlert({
          msg: "Completa nombre, tipo y área",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateZona(editId, form);
        setUiAlert({
          msg: "Zona actualizada correctamente",
          type: "success",
        });
      } else {
        await addZona(form);
        setUiAlert({
          msg: "Zona registrada correctamente",
          type: "success",
        });
      }
      const data = await getZonas();
      setZonas(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const zona = zonas.find((z) => z.id === id);
    if (zona) {
      const { id: _id, ...rest } = zona;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteZona(id);
    const data = await getZonas();
    setZonas(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Plano, Zonas y Geolocalización de la Granja
        </Typography>
        <Button
          variant="contained"
          sx={{ mb: 2, bgcolor: "#169b62" }}
          onClick={() => {
            setShowDialog(true);
            limpiarForm();
            setEditId(null);
          }}
        >
          Registrar Zona/Área
        </Button>
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
              <tr style={{ background: "#169b62", color: "#fff", height: 33 }}>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Ubicación GPS</th>
                <th>Área (m²)</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => (
                <tr key={z.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.nombre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.ubicacionGPS}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.areaM2}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {z.observaciones}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Button
                      size="small"
                      sx={{
                        background: "#169b62",
                        color: "#fff",
                        px: 2,
                        fontSize: 13,
                        borderRadius: 1,
                        fontWeight: 700,
                        mr: 1,
                      }}
                      onClick={() => handleEditar(z.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      sx={{
                        background: "#b52424",
                        color: "#fff",
                        px: 2,
                        fontSize: 13,
                        borderRadius: 1,
                        fontWeight: 700,
                      }}
                      onClick={() => handleEliminar(z.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Dialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditId(null);
            limpiarForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editId ? "Editar Zona" : "Registrar Zona"}
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 3,
            }}
          >
            <Box
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as ZonaGranja["tipo"],
                  }))
                }
                sx={{ minWidth: 180 }}
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Ubicación GPS"
                placeholder="lat,lon"
                value={form.ubicacionGPS}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ubicacionGPS: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Área (m²)"
                type="number"
                value={form.areaM2}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    areaM2: Number(e.target.value) || 0,
                  }))
                }
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observaciones: e.target.value }))
                }
                fullWidth
                multiline
                minRows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleGuardar}
              variant="contained"
              sx={{ bgcolor: "#169b62" }}
            >
              Guardar
            </Button>
            <Button
              onClick={() => {
                setShowDialog(false);
                setEditId(null);
                limpiarForm();
              }}
              variant="outlined"
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
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
