// src/pages/Insumos/Medicamentos.tsx
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
  getMedicamentos,
  addMedicamento,
  updateMedicamento,
  deleteMedicamento,
  Medicamento,
  NuevoMedicamento,
} from "../../services/insumos/Medicamentos";

const tipoOptions = [
  "Vacuna",
  "Antibiótico",
  "Antiparasitario",
  "Desinfectante",
  "Otro",
] as const;

const emptyForm: NuevoMedicamento = {
  nombre: "",
  principio: "",
  lote: "",
  vencimiento: "",
  laboratorio: "",
  tipo: "Vacuna",
  condiciones: "",
  proveedor: "",
  stock: 0,
  unidad: "unid",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function MedicamentosPage() {
  const [productos, setProductos] = useState<Medicamento[]>([]);
  const [form, setForm] = useState<NuevoMedicamento>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getMedicamentos();
      setProductos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.nombre || !form.lote || !form.vencimiento) {
        setUiAlert({
          msg: "Completa nombre, lote y vencimiento",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateMedicamento(editId, form);
        setUiAlert({
          msg: "Medicamento actualizado correctamente",
          type: "success",
        });
      } else {
        await addMedicamento(form);
        setUiAlert({
          msg: "Medicamento agregado correctamente",
          type: "success",
        });
      }
      const data = await getMedicamentos();
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
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteMedicamento(id);
    const data = await getMedicamentos();
    setProductos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Inventario de Medicamentos y Biológicos
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
          Registrar Medicamento
        </Button>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1200,
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
                <th>Nombre</th>
                <th>Principio</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Laboratorio</th>
                <th>Tipo</th>
                <th>Condiciones</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th style={{ paddingRight: 12 }}>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.nombre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.principio}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.lote}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.vencimiento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.laboratorio}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.condiciones}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.proveedor}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.stock}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.unidad}
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
            {editId ? "Editar Medicamento" : "Registrar Medicamento"}
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
                label="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre: e.target.value }))
                }
              />
              <TextField
                label="Principio"
                value={form.principio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, principio: e.target.value }))
                }
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
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
                label="Laboratorio"
                value={form.laboratorio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, laboratorio: e.target.value }))
                }
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as Medicamento["tipo"],
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
                label="Condiciones"
                value={form.condiciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, condiciones: e.target.value }))
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
                label="Unidad"
                value={form.unidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unidad: e.target.value }))
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
