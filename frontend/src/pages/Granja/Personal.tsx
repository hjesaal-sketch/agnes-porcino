// src/pages/Granja/Personal.tsx
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
  getPersonal,
  addPersonal,
  updatePersonal,
  deletePersonal,
  PersonalGranja,
  NuevoPersonalGranja,
} from "../../services/granja/Personal";

const turnoOptions = ["Mañana", "Tarde", "Noche", "Rotativo"] as const;
const estadoOptions = ["Activo", "Suspendido", "Baja"] as const;

const emptyForm: NuevoPersonalGranja = {
  nombre: "",
  cargo: "",
  turno: "Mañana",
  capacitaciones: "",
  fechaIngreso: "",
  estado: "Activo",
  contacto: "",
  organigrama: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Personal() {
  const [personal, setPersonal] = useState<PersonalGranja[]>([]);
  const [form, setForm] = useState<NuevoPersonalGranja>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getPersonal();
      setPersonal(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.nombre || !form.cargo) {
        setUiAlert({
          msg: "Completa nombre y cargo",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updatePersonal(editId, form);
        setUiAlert({
          msg: "Personal actualizado correctamente",
          type: "success",
        });
      } else {
        await addPersonal(form);
        setUiAlert({
          msg: "Personal registrado correctamente",
          type: "success",
        });
      }
      const data = await getPersonal();
      setPersonal(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const pers = personal.find((p) => p.id === id);
    if (pers) {
      const { id: _id, ...rest } = pers;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deletePersonal(id);
    const data = await getPersonal();
    setPersonal(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1150, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Gestión de Personal y RRHH de la Granja
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
          Registrar Personal
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
                <th>Cargo</th>
                <th>Turno</th>
                <th>Capacitaciones</th>
                <th>Fecha Ingreso</th>
                <th>Estado</th>
                <th>Contacto</th>
                <th>Organigrama</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.nombre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.cargo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.turno}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.capacitaciones}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.fechaIngreso}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.estado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.contacto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {p.organigrama}
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
            {editId ? "Editar Personal" : "Registrar Personal"}
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
                label="Cargo"
                value={form.cargo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cargo: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Turno"
                select
                value={form.turno}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    turno: e.target.value as PersonalGranja["turno"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {turnoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Capacitaciones"
                value={form.capacitaciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capacitaciones: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Fecha Ingreso"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaIngreso}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaIngreso: e.target.value }))
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
                    estado: e.target.value as PersonalGranja["estado"],
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
                label="Contacto"
                value={form.contacto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contacto: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Organigrama"
                value={form.organigrama}
                onChange={(e) =>
                  setForm((f) => ({ ...f, organigrama: e.target.value }))
                }
                sx={{ minWidth: 220 }}
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
