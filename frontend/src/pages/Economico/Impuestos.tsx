// src/pages/Economico/Impuestos.tsx
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  getImpuestos,
  addImpuesto,
  updateImpuesto,
  deleteImpuesto,
  ImpuestoEconomico,
  NuevoImpuestoEconomico,
} from "../../services/economico/Impuestos";

const tipoOptions = ["IVA", "ISLR", "Arancel", "Otro"] as const;

const emptyForm: NuevoImpuestoEconomico = {
  fecha: "",
  tipo: "IVA",
  monto: 0,
  descripcion: "",
  pagado: false,
  vencimiento: "",
  responsable: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function EconomicoImpuestos() {
  const [impuestos, setImpuestos] = useState<ImpuestoEconomico[]>([]);
  const [form, setForm] = useState<NuevoImpuestoEconomico>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getImpuestos();
        setImpuestos(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando impuestos económicos",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargar = async () => {
    const data = await getImpuestos();
    setImpuestos(data);
  };

  const handleGuardar = async () => {
    if (!form.fecha || !form.tipo || form.monto <= 0) {
      setUiAlert({
        msg: "Completa fecha, tipo y un monto mayor a 0",
        type: "error",
      });
      return;
    }
    try {
      if (editId !== null) {
        await updateImpuesto(editId, form);
        setUiAlert({
          msg: "Impuesto actualizado correctamente",
          type: "success",
        });
      } else {
        await addImpuesto(form);
        setUiAlert({
          msg: "Impuesto registrado correctamente",
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
    const imp = impuestos.find((x) => x.id === id);
    if (!imp) return;
    const { id: _id, ...rest } = imp;
    setForm(rest);
    setEditId(id);
    setShowDialog(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteImpuesto(id);
      await recargar();
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error al eliminar impuesto",
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
          Impuestos y Tributación
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
          Registrar Impuesto
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
                <th>Monto</th>
                <th>Pagado</th>
                <th>Vencimiento</th>
                <th>Responsable</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {impuestos.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.monto.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.pagado ? "Sí" : "No"}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.vencimiento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.descripcion}
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
                      onClick={() => handleEditar(i.id)}
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
                      onClick={() => handleEliminar(i.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {!impuestos.length && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 12, fontSize: 13 }}
                  >
                    Sin impuestos registrados
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
            {editId ? "Editar Impuesto" : "Registrar Impuesto"}
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
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as ImpuestoEconomico["tipo"],
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
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.pagado}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pagado: e.target.checked }))
                    }
                  />
                }
                label="Pagado"
              />
              <TextField
                label="Vencimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.vencimiento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vencimiento: e.target.value }))
                }
              />
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
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
