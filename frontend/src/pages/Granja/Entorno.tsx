// src/pages/Granja/Entorno.tsx
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
  getEventosEntorno,
  addEventoEntorno,
  updateEventoEntorno,
  deleteEventoEntorno,
  EventoEntorno,
  NuevoEventoEntorno,
} from "../../services/granja/Entorno";

const tipoOptions = [
  "Comunitario",
  "Ambiental",
  "Geográfico",
  "Contexto legal",
  "Otro",
] as const;

const impactoOptions = ["Positivo", "Negativo", "Neutro"] as const;

const emptyForm: NuevoEventoEntorno = {
  fecha: "",
  tipo: "Comunitario",
  descripcion: "",
  actores: "",
  impacto: "Positivo",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Entorno() {
  const [eventos, setEventos] = useState<EventoEntorno[]>([]);
  const [form, setForm] = useState<NuevoEventoEntorno>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getEventosEntorno();
      setEventos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.tipo || !form.descripcion) {
        setUiAlert({
          msg: "Completa fecha, tipo y descripción",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateEventoEntorno(editId, form);
        setUiAlert({
          msg: "Registro actualizado correctamente",
          type: "success",
        });
      } else {
        await addEventoEntorno(form);
        setUiAlert({
          msg: "Evento registrado correctamente",
          type: "success",
        });
      }
      const data = await getEventosEntorno();
      setEventos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const evento = eventos.find((e) => e.id === id);
    if (evento) {
      const { id: _id, ...rest } = evento;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteEventoEntorno(id);
    const data = await getEventosEntorno();
    setEventos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 950, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Relaciones Comunitarias y Entorno
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
          Registrar Evento
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
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Actores</th>
                <th>Impacto</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.actores}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.impacto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.observaciones}
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
                      onClick={() => handleEditar(e.id)}
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
                      onClick={() => handleEliminar(e.id)}
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
            {editId ? "Editar Evento" : "Registrar Evento"}
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
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as EventoEntorno["tipo"],
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
                multiline
                minRows={2}
              />
              <TextField
                label="Actores"
                value={form.actores}
                onChange={(e) =>
                  setForm((f) => ({ ...f, actores: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Impacto"
                select
                value={form.impacto}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    impacto: e.target.value as EventoEntorno["impacto"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {impactoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observaciones: e.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
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
