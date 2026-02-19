// src/pages/Gestacion/PartosProgramados.tsx
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
} from "@mui/material";
import {
  getPartos,
  addParto,
  updateParto,
  deleteParto,
  PartoProgramado,
} from "../../services/gestacion/PartosProgramados";

const tipoServicioOptions = [
  "Natural",
  "Inseminación",
  "Transferencia Embrionaria",
] as const;

// Formulario solo con campos editables desde UI
// DESPUÉS
type PartoForm = {
  idMadre: string;
  fechaServicio: string;
  fechaProbableParto: string;
  tipoServicio: PartoProgramado["tipoServicio"];
  observaciones: string;
};

const emptyForm: PartoForm = {
  idMadre: "",
  fechaServicio: "",
  fechaProbableParto: "",
  tipoServicio: "Natural",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function GestacionPartosProgramados() {
  const [partos, setPartos] = useState<PartoProgramado[]>([]);
  const [form, setForm] = useState<PartoForm>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPartos();
        setPartos(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar partos programados",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargarPartos = async () => {
    const data = await getPartos();
    setPartos(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.idMadre || !form.fechaServicio) {
        setUiAlert({
          msg: "Debes completar ID Madre y Fecha de servicio",
          type: "error",
        });
        return;
      }

      // payload hacia el servicio: se deja que el backend calcule fechaProbableParto
      const payload = {
        idMadre: form.idMadre,
        fechaServicio: form.fechaServicio,
        fechaProbableParto: form.fechaProbableParto || undefined,
        tipoServicio: form.tipoServicio,
        observaciones: form.observaciones,
      };

      if (editId !== null) {
        await updateParto(editId, {
          fechaServicio: payload.fechaServicio,
          fechaProbableParto: payload.fechaProbableParto,
          tipoServicio: payload.tipoServicio,
          observaciones: payload.observaciones,
        });
        setUiAlert({
          msg: "Parto reprogramado correctamente",
          type: "success",
        });
      } else {
        await addParto(payload);
        setUiAlert({
          msg: "Parto programado correctamente",
          type: "success",
        });
      }

      await recargarPartos();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error inesperado", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const parto = partos.find((p) => p.id === id);
    if (parto) {
      setForm({
        idMadre: parto.idMadre,
        fechaServicio: parto.fechaServicio,
        fechaProbableParto: parto.fechaProbableParto,
        tipoServicio: parto.tipoServicio,
        observaciones: parto.observaciones || "",
      });
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteParto(id);
      await recargarPartos();
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
          Programación y Predicción de Partos
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
          Programar Parto
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
                <th>Fecha Servicio</th>
                <th>Fecha Prob. Parto</th>
                <th>Tipo Servicio</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {partos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.idMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.fechaServicio}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.fechaProbableParto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.tipoServicio}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.observaciones}
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
                      onClick={() => handleEditar(p.id)}
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
                      onClick={() => handleEliminar(p.id)}
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
            {editId !== null ? "Editar Parto" : "Programar Parto"}
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
                label="ID Madre"
                value={form.idMadre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, idMadre: e.target.value }))
                }
              />
              <TextField
                label="Fecha Servicio"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaServicio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaServicio: e.target.value }))
                }
              />
              <TextField
                label="Fecha Probable Parto"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaProbableParto}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fechaProbableParto: e.target.value,
                  }))
                }
                helperText="Si la dejas vacía, el sistema la calculará"
              />
              <TextField
                label="Tipo Servicio"
                select
                SelectProps={{ native: true }}
                value={form.tipoServicio}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipoServicio:
                      e.target.value as PartoProgramado["tipoServicio"],
                  }))
                }
              >
                {tipoServicioOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
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
