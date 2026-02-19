// src/pages/Granja/Equipos.tsx
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
  getEquiposGranja,
  addEquipoGranja,
  updateEquipoGranja,
  deleteEquipoGranja,
  EquipoGranja,
  NuevoEquipoGranja,
} from "../../services/granja/Equipos";

const categoriaOptions = [
  "Maquinaria",
  "Herramienta",
  "Equipo Electrónico",
  "Vehículo",
  "Otro",
] as const;

const estadoOptions = ["Operativo", "Mantenimiento", "Baja"] as const;

const emptyForm: NuevoEquipoGranja = {
  descripcion: "",
  categoria: "Maquinaria",
  marca: "",
  modelo: "",
  cantidad: 0,
  estado: "Operativo",
  ubicacion: "",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Equipos() {
  const [equipos, setEquipos] = useState<EquipoGranja[]>([]);
  const [form, setForm] = useState<NuevoEquipoGranja>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getEquiposGranja();
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
        await updateEquipoGranja(editId, form);
        setUiAlert({
          msg: "Equipo actualizado correctamente",
          type: "success",
        });
      } else {
        await addEquipoGranja(form);
        setUiAlert({
          msg: "Equipo registrado correctamente",
          type: "success",
        });
      }
      const data = await getEquiposGranja();
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
    await deleteEquipoGranja(id);
    const data = await getEquiposGranja();
    setEquipos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1100, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Maquinaria, Equipos y Herramientas de la Granja
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
                <th>Marca</th>
                <th>Modelo</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Responsable</th>
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
                    {e.cantidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.estado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.ubicacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {e.responsable}
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
                sx={{ minWidth: 240 }}
              />
              <TextField
                label="Categoría"
                select
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoria: e.target.value as EquipoGranja["categoria"],
                  }))
                }
                sx={{ minWidth: 180 }}
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
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="Modelo"
                value={form.modelo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modelo: e.target.value }))
                }
                sx={{ minWidth: 160 }}
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
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Estado"
                select
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estado: e.target.value as EquipoGranja["estado"],
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
                label="Ubicación"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ubicacion: e.target.value }))
                }
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
                sx={{ minWidth: 200 }}
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
