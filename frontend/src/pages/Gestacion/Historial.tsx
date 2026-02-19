// src/pages/Gestacion/Historial.tsx
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
  Autocomplete,
} from "@mui/material";
import {
  getHistorial,
  addRegistro,
  updateRegistro,
  deleteRegistro,
  HistorialGestacion,
  TipoEventoHistorial,
} from "../../services/gestacion/Historial";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const tipoEventoOptions: TipoEventoHistorial[] = [
  "Servicio",
  "Confirmación",
  "Parto",
  "Reinserción",
  "Baja",
  "Aborto",
];

const emptyForm: Omit<HistorialGestacion, "id"> = {
  identificacionMadre: "",
  fechaEvento: "",
  tipoEvento: "Servicio",
  resultado: "",
  lote: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function GestacionHistorial() {
  const [historial, setHistorial] = useState<HistorialGestacion[]>([]);
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [form, setForm] = useState<Omit<HistorialGestacion, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const [hist, ms] = await Promise.all([getHistorial(), getMadres()]);
        setHistorial(hist);
        setMadres(ms);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar historial",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargarHistorial = async () => {
    const data = await getHistorial();
    setHistorial(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.identificacionMadre || !form.fechaEvento || !form.tipoEvento) {
        setUiAlert({
          msg: "Debes completar todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      if (editId !== null) {
        await updateRegistro(String(editId), form);
        setUiAlert({
          msg: "Registro actualizado correctamente",
          type: "success",
        });
      } else {
        await addRegistro(form);
        setUiAlert({
          msg: "Registro agregado correctamente",
          type: "success",
        });
      }

      await recargarHistorial();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error inesperado",
        type: "error",
      });
    }
  };

  const handleEditar = (id: number) => {
    const registro = historial.find((h) => h.id === id);
    if (registro) {
      const { id: _id, ...rest } = registro;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteRegistro(String(id));
      await recargarHistorial();
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al eliminar registro",
        type: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setUiAlert(null);
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Historial de Gestación
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
          Agregar Evento Historial
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
              <tr style={{ background: "#169b62", color: "#fff", height: 41 }}>
                <th>ID Madre</th>
                <th>Fecha Evento</th>
                <th>Tipo Evento</th>
                <th>Resultado</th>
                <th>Lote</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => {
                const madre = madres.find(
                  (m) => m.id === Number(h.identificacionMadre)
                );
                return (
                  <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {madre?.identificacion ?? h.identificacionMadre}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {h.fechaEvento}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {h.tipoEvento}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {h.resultado}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {h.lote}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {h.observaciones}
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
                        onClick={() => handleEditar(h.id)}
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
                        onClick={() => handleEliminar(h.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
            {editId !== null ? "Editar Evento" : "Agregar Evento"}
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
              <Autocomplete
                options={madres}
                getOptionLabel={(option) => option.identificacion}
                filterOptions={(options, state) =>
                  options.filter((o) =>
                    o.identificacion
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
                value={
                  madres.find(
                    (m) =>
                      m.id === Number(form.identificacionMadre) ||
                      m.identificacion === form.identificacionMadre
                  ) || null
                }
                onChange={(_, value) =>
                  setForm((f) => ({
                    ...f,
                    // guardamos el id numérico de la madre en el historial
                    identificacionMadre: value
                      ? String(value.id)
                      : "",
                  }))
                }
                inputValue={(() => {
                  const madreSel = madres.find(
                    (m) =>
                      m.id === Number(form.identificacionMadre) ||
                      m.identificacion === form.identificacionMadre
                  );
                  return madreSel?.identificacion ?? form.identificacionMadre;
                })()}
                onInputChange={(_, value) =>
                  setForm((f) => ({ ...f, identificacionMadre: value }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="ID Madre" />
                )}
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Fecha Evento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaEvento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fechaEvento: e.target.value,
                  }))
                }
              />
              <TextField
                label="Tipo Evento"
                select
                SelectProps={{ native: true }}
                value={form.tipoEvento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipoEvento:
                      e.target.value as HistorialGestacion["tipoEvento"],
                  }))
                }
              >
                {tipoEventoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Resultado"
                value={form.resultado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, resultado: e.target.value }))
                }
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    observaciones: e.target.value,
                  }))
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
