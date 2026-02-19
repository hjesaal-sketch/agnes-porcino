// src/pages/Granja/Instalaciones.tsx
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
  getInstalaciones,
  addInstalacion,
  updateInstalacion,
  deleteInstalacion,
  InstalacionGranja,
  NuevaInstalacionGranja,
} from "../../services/granja/Instalaciones";

const tipoOptions = [
  "Galpón",
  "Depósito",
  "Oficina",
  "Corral",
  "Enfermería",
  "Otro",
] as const;

const estadoOptions = ["Operativa", "Mantenimiento", "Inactiva"] as const;

const emptyForm: NuevaInstalacionGranja = {
  nombre: "",
  tipo: "Galpón",
  superficieM2: 0,
  capacidad: "",
  estado: "Operativa",
  descripcion: "",
  ubicacionZona: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Instalaciones() {
  const [instalaciones, setInstalaciones] = useState<InstalacionGranja[]>([]);
  const [form, setForm] = useState<NuevaInstalacionGranja>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getInstalaciones();
      setInstalaciones(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.nombre || !form.tipo || form.superficieM2 < 1) {
        setUiAlert({
          msg: "Completa nombre, tipo y superficie",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateInstalacion(editId, form);
        setUiAlert({
          msg: "Instalación actualizada correctamente",
          type: "success",
        });
      } else {
        await addInstalacion(form);
        setUiAlert({
          msg: "Instalación registrada correctamente",
          type: "success",
        });
      }
      const data = await getInstalaciones();
      setInstalaciones(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const inst = instalaciones.find((i) => i.id === id);
    if (inst) {
      const { id: _id, ...rest } = inst;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteInstalacion(id);
    const data = await getInstalaciones();
    setInstalaciones(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1100, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Instalaciones, Edificaciones e Inventario Físico
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
          Registrar Instalación
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
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Superficie (m²)</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Zona/Ubi</th>
                <th>Descripción</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instalaciones.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.nombre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.superficieM2}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.capacidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.estado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.ubicacionZona}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {i.descripcion}
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
            {editId ? "Editar Instalación" : "Registrar Instalación"}
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
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as InstalacionGranja["tipo"],
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
                label="Superficie (m²)"
                type="number"
                value={form.superficieM2}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    superficieM2: Number(e.target.value) || 0,
                  }))
                }
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="Capacidad"
                value={form.capacidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capacidad: e.target.value }))
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
                    estado: e.target.value as InstalacionGranja["estado"],
                  }))
                }
                sx={{ minWidth: 180 }}
              >
                {estadoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Zona/Ubi"
                value={form.ubicacionZona}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ubicacionZona: e.target.value }))
                }
                sx={{ minWidth: 200 }}
              />
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
