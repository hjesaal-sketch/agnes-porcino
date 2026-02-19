// src/pages/Insumos/Limpieza.tsx
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
  getProductosLimpieza,
  addProductoLimpieza,
  updateProductoLimpieza,
  deleteProductoLimpieza,
  ProductoLimpieza,
  NuevoProductoLimpieza,
} from "../../services/insumos/Limpieza";

const tipoOptions = [
  "Desinfectante",
  "Detergente",
  "Insecticida",
  "Rodenticida",
  "Bioseguridad",
  "Otro",
] as const;

const emptyForm: NuevoProductoLimpieza = {
  producto: "",
  tipo: "Desinfectante",
  concentracion: "",
  cantidad: 0,
  unidad: "lt",
  stock: 0,
  area: "",
  proveedor: "",
  vencimiento: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Limpieza() {
  const [productos, setProductos] = useState<ProductoLimpieza[]>([]);
  const [form, setForm] = useState<NuevoProductoLimpieza>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getProductosLimpieza();
      setProductos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.producto || form.cantidad < 1 || !form.area) {
        setUiAlert({
          msg: "Completa producto, cantidad y área",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateProductoLimpieza(editId, form);
        setUiAlert({
          msg: "Producto actualizado correctamente",
          type: "success",
        });
      } else {
        await addProductoLimpieza(form);
        setUiAlert({
          msg: "Producto agregado correctamente",
          type: "success",
        });
      }
      const data = await getProductosLimpieza();
      setProductos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      const { id: _id, ...rest } = producto;
      setForm({
        producto: rest.producto,
        tipo: rest.tipo,
        concentracion: rest.concentracion,
        cantidad: rest.cantidad,
        unidad: rest.unidad,
        stock: rest.stock,
        area: rest.area,
        proveedor: rest.proveedor,
        vencimiento: rest.vencimiento,
        observaciones: rest.observaciones,
      });
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteProductoLimpieza(id);
    const data = await getProductosLimpieza();
    setProductos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Inventario de Productos de Limpieza y Bioseguridad
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
          Registrar Producto
        </Button>

        {/* Contenedor con scroll horizontal y tabla ensanchada */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              minWidth: 1100,
              borderCollapse: "collapse",
              background: "#fff",
              marginBottom: 24,
              boxShadow: "0 1px 8px #0001",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 33 }}>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Concentración</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Área</th>
                <th>Proveedor</th>
                <th>Vencimiento</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.producto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.concentracion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.cantidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.unidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.stock}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.area}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.proveedor}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.vencimiento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
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
            {editId ? "Editar Producto" : "Registrar Producto"}
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
                label="Producto"
                value={form.producto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, producto: e.target.value }))
                }
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as ProductoLimpieza["tipo"],
                  }))
                }
                sx={{ minWidth: 120 }}
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Concentración"
                value={form.concentracion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, concentracion: e.target.value }))
                }
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
                label="Área"
                value={form.area}
                onChange={(e) =>
                  setForm((f) => ({ ...f, area: e.target.value }))
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
                label="Fecha Vencimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.vencimiento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vencimiento: e.target.value }))
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
