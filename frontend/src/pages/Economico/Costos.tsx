// src/pages/Economico/Costos.tsx
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
  getCostos,
  addCosto,
  updateCosto,
  deleteCosto,
  CostoEconomico,
  NuevoCostoEconomico,
} from "../../services/economico/Costos";

const categoriaOptions = ["Fijo", "Variable", "Indirecto", "Otro"] as const;

const emptyForm: NuevoCostoEconomico = {
  fecha: "",
  categoria: "Fijo",
  concepto: "",
  monto: 0,
  responsable: "",
  descripcion: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function EconomicoCostos() {
  const [costos, setCostos] = useState<CostoEconomico[]>([]);
  const [form, setForm] = useState<NuevoCostoEconomico>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCostos();
        setCostos(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando costos económicos",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargar = async () => {
    const data = await getCostos();
    setCostos(data);
  };

  const handleGuardar = async () => {
    if (!form.fecha || !form.categoria || form.monto <= 0) {
      setUiAlert({
        msg: "Completa fecha, categoría y un monto mayor a 0",
        type: "error",
      });
      return;
    }
    try {
      if (editId !== null) {
        await updateCosto(editId, form);
        setUiAlert({
          msg: "Costo actualizado correctamente",
          type: "success",
        });
      } else {
        await addCosto(form);
        setUiAlert({
          msg: "Costo registrado correctamente",
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
    const c = costos.find((x) => x.id === id);
    if (!c) return;
    const { id: _id, ...rest } = c;
    setForm(rest);
    setEditId(id);
    setShowDialog(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteCosto(id);
      await recargar();
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error al eliminar costo",
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
          Costos Económicos
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
          Registrar Costo
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
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Responsable</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {costos.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.categoria}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.concepto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.monto.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.descripcion}
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
                      onClick={() => handleEditar(c.id)}
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
                      onClick={() => handleEliminar(c.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {!costos.length && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 12, fontSize: 13 }}
                  >
                    Sin costos registrados
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
            {editId ? "Editar Costo Económico" : "Registrar Costo Económico"}
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
                label="Categoría"
                select
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoria: e.target.value as CostoEconomico["categoria"],
                  }))
                }
                sx={{ minWidth: 200 }}
              >
                {categoriaOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Concepto"
                value={form.concepto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, concepto: e.target.value }))
                }
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
