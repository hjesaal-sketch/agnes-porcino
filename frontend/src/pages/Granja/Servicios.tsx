// src/pages/Granja/Servicios.tsx
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
  getServicios,
  addServicio,
  updateServicio,
  deleteServicio,
  ServicioGranja,
  NuevoServicioGranja,
} from "../../services/granja/Servicios";

const tipoOptions = [
  "Agua",
  "Electricidad",
  "Residuos",
  "Gas",
  "Internet",
  "Otro",
] as const;

const estadoOptions = ["Operativo", "Interrumpido", "Mantenimiento"] as const;

const emptyForm: NuevoServicioGranja = {
  tipo: "Agua",
  fuente: "",
  cantidad: 0,
  unidad: "m3",
  fecha: "",
  estado: "Operativo",
  descripcion: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Servicios() {
  const [servicios, setServicios] = useState<ServicioGranja[]>([]);
  const [form, setForm] = useState<NuevoServicioGranja>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getServicios();
      setServicios(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.tipo || !form.fuente || !form.fecha) {
        setUiAlert({
          msg: "Completa tipo, fuente y fecha",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateServicio(editId, form);
        setUiAlert({
          msg: "Servicio actualizado correctamente",
          type: "success",
        });
      } else {
        await addServicio(form);
        setUiAlert({
          msg: "Servicio registrado correctamente",
          type: "success",
        });
      }
      const data = await getServicios();
      setServicios(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const servicio = servicios.find((s) => s.id === id);
    if (servicio) {
      const { id: _id, ...rest } = servicio;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteServicio(id);
    const data = await getServicios();
    setServicios(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Servicios Esenciales: Agua, Electricidad, Residuos
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
          Registrar Servicio
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
                <th>Tipo</th>
                <th>Fuente</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Descripción</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.tipo}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.fuente}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.cantidad}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.unidad}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{s.estado}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {s.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {s.observaciones}
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
                      onClick={() => handleEditar(s.id)}
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
                      onClick={() => handleEliminar(s.id)}
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
            {editId ? "Editar Servicio" : "Registrar Servicio"}
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
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as ServicioGranja["tipo"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Fuente"
                value={form.fuente}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fuente: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Cantidad"
                type="number"
                value={form.cantidad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cantidad: Number(e.target.value) || 0,
                  }))
                }
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="Unidad"
                value={form.unidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unidad: e.target.value }))
                }
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="Estado"
                select
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estado: e.target.value as ServicioGranja["estado"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {estadoOptions.map((op) => (
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
