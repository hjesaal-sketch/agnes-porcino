// src/pages/Economico/Egresos.tsx
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
  getEgresos,
  addEgreso,
  updateEgreso,
  deleteEgreso,
  EgresoEconomico,
  NuevoEgresoEconomico,
} from "../../services/economico/Egresos";

const tipoOptions = [
  "Compra insumos",
  "Pago servicios",
  "Salarios",
  "Otro",
] as const;

const emptyForm: NuevoEgresoEconomico = {
  fecha: "",
  beneficiario: "",
  tipo: "Compra insumos",
  monto: 0,
  responsable: "",
  descripcion: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function EconomicoEgresos() {
  const [egresos, setEgresos] = useState<EgresoEconomico[]>([]);
  const [form, setForm] = useState<NuevoEgresoEconomico>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEgresos();
        setEgresos(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando egresos económicos",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargar = async () => {
    const data = await getEgresos();
    setEgresos(data);
  };

  const handleGuardar = async () => {
    if (!form.fecha || !form.beneficiario || form.monto <= 0) {
      setUiAlert({
        msg: "Completa fecha, beneficiario y un monto mayor a 0",
        type: "error",
      });
      return;
    }
    try {
      if (editId !== null) {
        await updateEgreso(editId, form);
        setUiAlert({
          msg: "Egreso actualizado correctamente",
          type: "success",
        });
      } else {
        await addEgreso(form);
        setUiAlert({
          msg: "Egreso registrado correctamente",
          type: "success",
        });
      }
      await recargar();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error al guardar", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const eg = egresos.find((e) => e.id === id);
    if (!eg) return;
    const { id: _id, ...rest } = eg;
    setForm(rest);
    setEditId(id);
    setShowDialog(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteEgreso(id);
      await recargar();
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error al eliminar egreso",
        type: "error",
      });
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditId(null);
    limpiarForm();
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 900, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Egresos Económicos
        </Typography>

        <Button
          variant="contained"
          sx={{ mb: 2, bgcolor: "#169b62" }}
          onClick={() => {
            limpiarForm();
            setEditId(null);
            setShowDialog(true);
          }}
        >
          Registrar Egreso
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
                <th>Beneficiario</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Responsable</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {egresos.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.beneficiario}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.monto.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.descripcion}
                  </td>
                  <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
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
              {!egresos.length && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 12, fontSize: 13 }}
                  >
                    Sin egresos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Dialog
          open={showDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editId ? "Editar Egreso Económico" : "Registrar Egreso Económico"}
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
                label="Beneficiario"
                value={form.beneficiario}
                onChange={(e) =>
                  setForm((f) => ({ ...f, beneficiario: e.target.value }))
                }
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as EgresoEconomico["tipo"],
                  }))
                }
                sx={{ minWidth: 200 }}
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
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
              />
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
              />
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
            <Button onClick={handleCloseDialog} variant="outlined">
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
