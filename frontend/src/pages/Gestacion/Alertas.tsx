// src/pages/Gestacion/Alertas.tsx
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
  Chip,
} from "@mui/material";
import {
  getAlertas,
  addAlerta,
  updateAlerta,
  deleteAlerta,
  AlertaGestacion,
} from "../../services/gestacion/Alertas";

const tipoOptions = [
  "Sanitaria",
  "Reproductiva",
  "Bioseguridad",
  "Vencimiento",
  "Otro",
] as const;

const nivelOptions = ["Crítico", "Advertencia", "Informativo"] as const;
const estadoOptions = ["Abierta", "Cerrada"] as const;

const emptyForm: Omit<AlertaGestacion, "id"> = {
  fecha: "",
  tipo: "Sanitaria",
  nivel: "Crítico",
  descripcion: "",
  responsable: "",
  estado: "Abierta",
  acciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function GestacionAlertas() {
  const [alertas, setAlertas] = useState<AlertaGestacion[]>([]);
  const [form, setForm] = useState<Omit<AlertaGestacion, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAlertas();
        setAlertas(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar alertas",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargarAlertas = async () => {
    const data = await getAlertas();
    setAlertas(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.tipo || !form.nivel || !form.descripcion) {
        setUiAlert({
          msg: "Debes completar todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      if (editId !== null) {
        await updateAlerta(editId, form);
        setUiAlert({
          msg: "Alerta actualizada correctamente",
          type: "success",
        });
      } else {
        await addAlerta(form);
        setUiAlert({
          msg: "Alerta registrada correctamente",
          type: "success",
        });
      }

      await recargarAlertas();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error inesperado", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const a = alertas.find((al) => al.id === id);
    if (a) {
      const { id: _id, ...rest } = a;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteAlerta(id);
      await recargarAlertas();
      setUiAlert({ msg: "Alerta eliminada", type: "success" });
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error al eliminar alerta", type: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setUiAlert(null);
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alertas y Eventos Críticos Gestación
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
          Registrar Alerta
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
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Descripción</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Acciones/Resolución</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.tipo}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Chip
                      label={a.nivel}
                      color={
                        a.nivel === "Crítico"
                          ? "error"
                          : a.nivel === "Advertencia"
                          ? "warning"
                          : "info"
                      }
                      size="small"
                    />
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.responsable}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Chip
                      label={a.estado}
                      color={a.estado === "Cerrada" ? "success" : "error"}
                      size="small"
                    />
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {a.acciones}
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
                      onClick={() => handleEditar(a.id)}
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
                      onClick={() => handleEliminar(a.id)}
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
            {editId !== null ? "Editar Alerta" : "Registrar Alerta"}
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
                label="Tipo"
                select
                SelectProps={{ native: true }}
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as AlertaGestacion["tipo"],
                  }))
                }
              >
                {tipoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Nivel"
                select
                SelectProps={{ native: true }}
                value={form.nivel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nivel: e.target.value as AlertaGestacion["nivel"],
                  }))
                }
              >
                {nivelOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
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
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
              />
              <TextField
                label="Estado"
                select
                SelectProps={{ native: true }}
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estado: e.target.value as AlertaGestacion["estado"],
                  }))
                }
              >
                {estadoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Acciones/Resolución"
                value={form.acciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acciones: e.target.value }))
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
