// src/pages/Granja/Economico.tsx
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
  getMovimientos,
  addMovimiento,
  updateMovimiento,
  deleteMovimiento,
  MovimientoEconomico,
  NuevoMovimientoEconomico,
} from "../../services/granja/Economico";

const tipoOptions = ["Costo fijo", "Costo variable", "Venta", "Otro"] as const;

const emptyForm: NuevoMovimientoEconomico = {
  fecha: "",
  tipo: "Costo fijo",
  descripcion: "",
  categoria: "",
  monto: 0,
  responsable: "",
  comentarios: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Economico() {
  const [movimientos, setMovimientos] = useState<MovimientoEconomico[]>([]);
  const [form, setForm] = useState<NuevoMovimientoEconomico>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getMovimientos();
      setMovimientos(data);
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
        await updateMovimiento(editId, form);
        setUiAlert({
          msg: "Movimiento actualizado correctamente",
          type: "success",
        });
      } else {
        await addMovimiento(form);
        setUiAlert({
          msg: "Movimiento registrado correctamente",
          type: "success",
        });
      }
      const data = await getMovimientos();
      setMovimientos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const mov = movimientos.find((m) => m.id === id);
    if (mov) {
      const { id: _id, ...rest } = mov;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteMovimiento(id);
    const data = await getMovimientos();
    setMovimientos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1000, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Movimientos Económicos: Costos y Gestión Financiera
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
          Registrar Movimiento
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
                <th>Categoría</th>
                <th>Monto</th>
                <th>Responsable</th>
                <th>Comentarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.categoria}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.monto.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {m.comentarios}
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
                      onClick={() => handleEditar(m.id)}
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
                      onClick={() => handleEliminar(m.id)}
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
            {editId ? "Editar Movimiento" : "Registrar Movimiento"}
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
                    tipo: e.target.value as MovimientoEconomico["tipo"],
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
                label="Categoría"
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoria: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Monto"
                type="number"
                value={form.monto}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    monto: Number(e.target.value) || 0,
                  }))
                }
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Comentarios"
                value={form.comentarios}
                onChange={(e) =>
                  setForm((f) => ({ ...f, comentarios: e.target.value }))
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
