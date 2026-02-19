// src/pages/Genetica/Seminal.tsx
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
  getRegistrosSeminales,
  addRegistroSeminal,
  updateRegistroSeminal,
  deleteRegistroSeminal,
  RegistroSeminal,
  NuevoRegistroSeminal,
} from "../../services/genetica/Seminal";

const calidadOptions = ["Excelente", "Buena", "Regular", "Deficiente"] as const;

const emptyForm: NuevoRegistroSeminal = {
  fecha: "",
  identificacion: "",
  raza: "",
  volumen: 0,
  concentracion: 0,
  motilidad: "",
  calidad: "Excelente",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Seminal() {
  const [registros, setRegistros] = useState<RegistroSeminal[]>([]);
  const [form, setForm] = useState<NuevoRegistroSeminal>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getRegistrosSeminales();
      setRegistros(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (
        !form.identificacion ||
        !form.fecha ||
        form.volumen < 1 ||
        form.concentracion < 1
      ) {
        setUiAlert({
          msg: "Completa identificación, fecha, volumen y concentración",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateRegistroSeminal(editId, form);
        setUiAlert({
          msg: "Registro actualizado correctamente",
          type: "success",
        });
      } else {
        await addRegistroSeminal(form);
        setUiAlert({
          msg: "Registro seminal agregado correctamente",
          type: "success",
        });
      }
      const data = await getRegistrosSeminales();
      setRegistros(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const reg = registros.find((r) => r.id === id);
    if (reg) {
      const { id: _id, ...rest } = reg;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteRegistroSeminal(id);
    const data = await getRegistrosSeminales();
    setRegistros(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registros y Calidad de Producción Seminal
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
          Registrar Semen
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
                <th>ID Verraco</th>
                <th>Raza</th>
                <th>Vol. (ml)</th>
                <th>Concentración</th>
                <th>Motilidad</th>
                <th>Calidad</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.identificacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.raza}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.volumen}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.concentracion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.motilidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.calidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.observaciones}
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
                      onClick={() => handleEditar(v.id)}
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
                      onClick={() => handleEliminar(v.id)}
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
            {editId ? "Editar Registro" : "Registrar Producción Seminal"}
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
              />
              <TextField
                label="ID Verraco"
                value={form.identificacion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, identificacion: e.target.value }))
                }
              />
              <TextField
                label="Raza"
                value={form.raza}
                onChange={(e) =>
                  setForm((f) => ({ ...f, raza: e.target.value }))
                }
              />
              <TextField
                label="Volumen (ml)"
                type="number"
                value={form.volumen}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    volumen: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Concentración"
                type="number"
                value={form.concentracion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    concentracion: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Motilidad"
                value={form.motilidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, motilidad: e.target.value }))
                }
              />
              <TextField
                label="Calidad"
                select
                value={form.calidad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    calidad: e.target.value as RegistroSeminal["calidad"],
                  }))
                }
                sx={{ minWidth: 120 }}
              >
                {calidadOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
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
