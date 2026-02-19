// src/pages/Insumos/Generales.tsx
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
  getInsumosGenerales,
  addInsumoGeneral,
  updateInsumoGeneral,
  deleteInsumoGeneral,
  InsumoGeneral,
  NuevoInsumoGeneral,
} from "../../services/insumos/Generales";

const categoriaOptions = [
  "Oficina",
  "Identificación",
  "Empaque",
  "Repuestos",
  "Otro",
] as const;

const emptyForm: NuevoInsumoGeneral = {
  descripcion: "",
  categoria: "Oficina",
  cantidad: 0,
  unidad: "unid",
  stock: 0,
  proveedor: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Generales() {
  const [insumos, setInsumos] = useState<InsumoGeneral[]>([]);
  const [form, setForm] = useState<NuevoInsumoGeneral>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getInsumosGenerales();
      setInsumos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.descripcion || form.cantidad < 1) {
        setUiAlert({
          msg: "Completa descripción y cantidad",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateInsumoGeneral(editId, form);
        setUiAlert({
          msg: "Insumo actualizado correctamente",
          type: "success",
        });
      } else {
        await addInsumoGeneral(form);
        setUiAlert({
          msg: "Insumo agregado correctamente",
          type: "success",
        });
      }
      const data = await getInsumosGenerales();
      setInsumos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const ing = insumos.find((i) => i.id === id);
    if (ing) {
      const { id: _id, ...rest } = ing;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteInsumoGeneral(id);
    const data = await getInsumosGenerales();
    setInsumos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Insumos, Suministros y Materiales Generales
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
          Registrar Insumo
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
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Proveedor</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.categoria}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.cantidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.unidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.stock}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.proveedor}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.observaciones}
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
            {editId ? "Editar Insumo" : "Registrar Insumo"}
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
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
              />
              <TextField
                label="Categoría"
                select
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoria: e.target.value as InsumoGeneral["categoria"],
                  }))
                }
                sx={{ minWidth: 120 }}
              >
                {categoriaOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
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
              />
              <TextField
                label="Unidad"
                value={form.unidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unidad: e.target.value }))
                }
              />
              <TextField
                label="Stock"
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    stock: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Proveedor"
                value={form.proveedor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, proveedor: e.target.value }))
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
