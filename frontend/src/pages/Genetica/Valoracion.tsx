// src/pages/Genetica/Valoracion.tsx
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
  getValoraciones,
  addValoracion,
  updateValoracion,
  deleteValoracion,
  ValoracionGenetica,
  NuevaValoracionGenetica,
} from "../../services/genetica/Valoracion";

const pruebaOptions = [
  "Indice Genético",
  "Test ADN",
  "Morfología",
  "Sanidad",
  "Otro",
] as const;

const emptyForm: NuevaValoracionGenetica = {
  fecha: "",
  identificacion: "",
  raza: "",
  resultado: "",
  prueba: "Indice Genético",
  evaluador: "",
  score: 0,
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Valoracion() {
  const [valoraciones, setValoraciones] = useState<ValoracionGenetica[]>([]);
  const [form, setForm] = useState<NuevaValoracionGenetica>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getValoraciones();
      setValoraciones(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.identificacion || !form.prueba || !form.resultado) {
        setUiAlert({
          msg: "Completa identificación, prueba y resultado",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateValoracion(editId, form);
        setUiAlert({
          msg: "Valoración actualizada correctamente",
          type: "success",
        });
      } else {
        await addValoracion(form);
        setUiAlert({
          msg: "Valoración registrada correctamente",
          type: "success",
        });
      }
      const data = await getValoraciones();
      setValoraciones(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const v = valoraciones.find((x) => x.id === id);
    if (v) {
      const { id: _id, ...rest } = v;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteValoracion(id);
    const data = await getValoraciones();
    setValoraciones(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Valoración Genética y Análisis
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
          Registrar Valoración
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
                <th>ID Animal</th>
                <th>Raza</th>
                <th>Prueba</th>
                <th>Resultado</th>
                <th>Evaluador</th>
                <th>Score</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {valoraciones.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.identificacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.raza}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.prueba}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.resultado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.evaluador}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.score}
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
            {editId ? "Editar Valoración" : "Registrar Valoración"}
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
                label="ID Animal"
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
                label="Prueba"
                select
                value={form.prueba}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    prueba: e.target.value as ValoracionGenetica["prueba"],
                  }))
                }
              >
                {pruebaOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
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
                label="Evaluador"
                value={form.evaluador}
                onChange={(e) =>
                  setForm((f) => ({ ...f, evaluador: e.target.value }))
                }
              />
              <TextField
                label="Score"
                type="number"
                value={form.score}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    score: Number(e.target.value) || 0,
                  }))
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
