// src/pages/Sitio3/Crecimiento.tsx
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
  getCrecimientoSitio3,
  addCrecimientoSitio3,
  updateCrecimientoSitio3,
  RegistroCrecimiento3,
  NuevoRegistroCrecimiento3,
} from "../../services/sitio3/Crecimiento";

const emptyForm: NuevoRegistroCrecimiento3 = {
  fecha: "",
  lote: "",
  corral: "",
  cantidad_pesada: 0,
  peso_promedio: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio3Crecimiento() {
  const [registros, setRegistros] = useState<RegistroCrecimiento3[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevoRegistroCrecimiento3>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCrecimientoSitio3();
        setRegistros(data);
      } catch (e: any) {
        setUiAlert({
          msg: e.message || "Error cargando pesajes Sitio 3",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.lote || !form.corral) {
        setUiAlert({
          msg: "Completa fecha, lote y corral",
          type: "error",
        });
        return;
      }
      if (form.cantidad_pesada <= 0 || form.peso_promedio <= 0) {
        setUiAlert({
          msg: "Cantidad y peso promedio deben ser > 0",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addCrecimientoSitio3(form);
        setUiAlert({
          msg: "Pesaje registrado correctamente",
          type: "success",
        });
      } else {
        await updateCrecimientoSitio3(editId, form);
        setUiAlert({
          msg: "Pesaje actualizado correctamente",
          type: "success",
        });
      }

      const data = await getCrecimientoSitio3();
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
          Seguimiento de Crecimiento y Pesajes – Sitio 3
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
          Registrar Pesaje
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
                <th>Lote</th>
                <th>Corral</th>
                <th>Cant. Pesada</th>
                <th>Peso Prom. (kg)</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.lote}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.corral}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.cantidad_pesada}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.peso_promedio}
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
            {editId === null ? "Registrar Pesaje" : "Editar Pesaje"}
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
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Corral"
                value={form.corral}
                onChange={(e) =>
                  setForm((f) => ({ ...f, corral: e.target.value }))
                }
              />
              <TextField
                label="Cantidad Pesada"
                type="number"
                value={form.cantidad_pesada}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cantidad_pesada: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Peso Promedio (kg)"
                type="number"
                value={form.peso_promedio}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    peso_promedio: Number(e.target.value) || 0,
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
