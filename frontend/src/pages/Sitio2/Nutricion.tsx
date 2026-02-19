// src/pages/Sitio2/Nutricion.tsx
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
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import {
  getNutricionSitio2,
  addNutricionSitio2,
  updateNutricionSitio2,
  RegistroNutricion,
  NuevoRegistroNutricion,
} from "../../services/sitio2/Nutricion";

const emptyForm: NuevoRegistroNutricion = {
  fecha: "",
  corral: "",
  dieta: "",
  alimento_consumido: 0,
  suplemento: "",
  cantidad_suplemento: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio2Nutricion() {
  const [registros, setRegistros] = useState<RegistroNutricion[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevoRegistroNutricion>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNutricionSitio2();
        setRegistros(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando registros nutricionales",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.corral || !form.dieta) {
        setUiAlert({
          msg: "Completa fecha, corral y dieta",
          type: "error",
        });
        return;
      }
      if (form.alimento_consumido < 0 || form.cantidad_suplemento < 0) {
        setUiAlert({
          msg: "Alimento y suplemento no pueden ser negativos",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addNutricionSitio2(form);
        setUiAlert({
          msg: "Registro nutricional agregado correctamente",
          type: "success",
        });
      } else {
        await updateNutricionSitio2(editId, form);
        setUiAlert({
          msg: "Registro nutricional actualizado correctamente",
          type: "success",
        });
      }

      const data = await getNutricionSitio2();
      setRegistros(data);
      setShowAdd(false);
      setEditId(null);
      limpiarForm();
    } catch (e: any) {
      setUiAlert({ msg: e.message || "Error", type: "error" });
    }
  };

  const handleEdit = (id: number) => {
    const reg = registros.find((r) => r.id === id);
    if (!reg) return;
    const { id: _id, ...rest } = reg;
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
          Nutrición y Alimentación – Sitio 2
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
          Registrar Consumo Nutricional
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
                <th>Fecha</th>
                <th>Corral</th>
                <th>Dieta</th>
                <th>Alimento (kg)</th>
                <th>Suplemento</th>
                <th>Cant. Suplemento</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.corral}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.dieta}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.alimento_consumido}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.suplemento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.cantidad_suplemento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.observaciones}
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
                      onClick={() => handleEdit(r.id)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Dialog
          open={showAdd}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editId === null ? "Registrar Consumo" : "Editar Registro"}
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
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Corral"
                value={form.corral}
                onChange={(e) =>
                  setForm((f) => ({ ...f, corral: e.target.value }))
                }
              />
              <TextField
                label="Dieta"
                value={form.dieta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dieta: e.target.value }))
                }
              />
              <TextField
                label="Alimento consumido (kg)"
                type="number"
                value={form.alimento_consumido}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    alimento_consumido: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Suplemento"
                value={form.suplemento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, suplemento: e.target.value }))
                }
              />
              <TextField
                label="Cantidad suplemento"
                type="number"
                value={form.cantidad_suplemento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cantidad_suplemento: Number(e.target.value) || 0,
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
