// src/pages/Sitio3/Corrales.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import {
  getCorralesSitio3,
  addCorralSitio3,
  updateCorralSitio3,
  Corral3,
  NuevoCorral3,
} from "../../services/sitio3/Corrales";

const emptyForm: NuevoCorral3 = {
  codigo: "",
  tipo: "Engorde",
  capacidad: 0,
  ocupacion_actual: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio3Corrales() {
  const [corrales, setCorrales] = useState<Corral3[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevoCorral3>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCorralesSitio3();
        setCorrales(data);
      } catch (e: any) {
        setUiAlert({
          msg: e.message || "Error cargando corrales Sitio 3",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.codigo || form.capacidad <= 0) {
        setUiAlert({
          msg: "Completa código y capacidad (>0)",
          type: "error",
        });
        return;
      }
      if (form.ocupacion_actual < 0 || form.ocupacion_actual > form.capacidad) {
        setUiAlert({
          msg: "La ocupación debe estar entre 0 y la capacidad",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addCorralSitio3(form);
        setUiAlert({ msg: "Corral registrado correctamente", type: "success" });
      } else {
        await updateCorralSitio3(editId, form);
        setUiAlert({ msg: "Corral actualizado correctamente", type: "success" });
      }

      const data = await getCorralesSitio3();
      setCorrales(data);
      setShowAdd(false);
      setEditId(null);
      limpiarForm();
    } catch (e: any) {
      setUiAlert({ msg: e.message || "Error", type: "error" });
    }
  };

  const handleEdit = (id: number) => {
    const c = corrales.find((x) => x.id === id);
    if (!c) return;
    const { id: _id, ...rest } = c;
    setForm(rest);
    setEditId(id);
    setShowAdd(true);
  };

  const handleCloseDialog = () => {
    setShowAdd(false);
    setEditId(null);
    limpiarForm();
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Manejo y Ubicaciones de Corrales – Sitio 3
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#169b62", mb: 2 }}
          onClick={() => {
            limpiarForm();
            setEditId(null);
            setShowAdd(true);
          }}
        >
          Registrar Corral
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
              <tr style={{ background: "#169b62", color: "#fff", height: 41 }}>
                <th>Código</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Ocupación Actual</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {corrales.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{c.codigo}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{c.tipo}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{c.capacidad}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.ocupacion_actual}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.observaciones}
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
                      }}
                      onClick={() => handleEdit(c.id)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Dialog open={showAdd} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editId === null ? "Registrar Corral" : "Editar Corral"}
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
                label="Código"
                value={form.codigo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, codigo: e.target.value }))
                }
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as NuevoCorral3["tipo"],
                  }))
                }
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="Engorde">Engorde</MenuItem>
                <MenuItem value="Aislamiento">Aislamiento</MenuItem>
                <MenuItem value="Cuarentena">Cuarentena</MenuItem>
              </TextField>
              <TextField
                label="Capacidad"
                type="number"
                value={form.capacidad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacidad: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Ocupación Actual"
                type="number"
                value={form.ocupacion_actual}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ocupacion_actual: Number(e.target.value) || 0,
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
