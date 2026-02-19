// src/pages/Insumos/Equipos.tsx
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
  getEquipos,
  addEquipo,
  updateEquipo,
  deleteEquipo,
  Equipo,
  NuevoEquipo,
} from "../../services/insumos/Equipos";

const categoriaOptions = [
  "Herramienta",
  "Equipo mayor",
  "Equipo menor",
  "Vehículo",
  "Otro",
] as const;

const emptyForm: NuevoEquipo = {
  descripcion: "",
  categoria: "Herramienta",
  marca: "",
  modelo: "",
  serie: "",
  cantidad: 0,
  unidad: "unid",
  stock: 0,
  ubicacion: "",
  proveedor: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [form, setForm] = useState<NuevoEquipo>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getEquipos();
      setEquipos(data);
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
        await updateEquipo(editId, form);
        setUiAlert({
          msg: "Equipo actualizado correctamente",
          type: "success",
        });
      } else {
        await addEquipo(form);
        setUiAlert({
          msg: "Equipo agregado correctamente",
          type: "success",
        });
      }
      const data = await getEquipos();
      setEquipos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const equipo = equipos.find((e) => e.id === id);
    if (equipo) {
      const { id: _id, ...rest } = equipo;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteEquipo(id);
    const data = await getEquipos();
    setEquipos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Inventario de Equipos y Herramientas
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
          Registrar Equipo
        </Button>

        {/* Contenedor con scroll horizontal y tabla ensanchada */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              minWidth: 1200, // evita congestión de headers, igual enfoque que en Medicamentos/Alimentos
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
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Ubicación</th>
                <th>Proveedor</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.descripcion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.categoria}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.marca}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.modelo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.serie}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.cantidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.unidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.stock}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.ubicacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.proveedor}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.observaciones}
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
            {editId ? "Editar Equipo" : "Registrar Equipo"}
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
                    categoria: e.target.value as Equipo["categoria"],
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
                label="Marca"
                value={form.marca}
                onChange={(e) =>
                  setForm((f) => ({ ...f, marca: e.target.value }))
                }
              />
              <TextField
                label="Modelo"
                value={form.modelo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modelo: e.target.value }))
                }
              />
              <TextField
                label="Serie"
                value={form.serie}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serie: e.target.value }))
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
                label="Ubicación"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ubicacion: e.target.value }))
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
