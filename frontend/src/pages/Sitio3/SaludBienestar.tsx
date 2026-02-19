// src/pages/Sitio3/SaludBienestar.tsx
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
  getSaludSitio3,
  addSaludSitio3,
  updateSaludSitio3,
  RegistroSalud3,
  NuevoRegistroSalud3,
} from "../../services/sitio3/SaludBienestar";

const emptyForm: NuevoRegistroSalud3 = {
  fecha: "",
  corral: "",
  lote: "",
  evento: "",
  tratamiento: "",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio3SaludBienestar() {
  const [registros, setRegistros] = useState<RegistroSalud3[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevoRegistroSalud3>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSaludSitio3();
        setRegistros(data);
      } catch (e: any) {
        setUiAlert({
          msg: e.message || "Error cargando eventos de salud/bienestar Sitio 3",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.corral || !form.evento) {
        setUiAlert({
          msg: "Completa fecha, corral y evento",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addSaludSitio3(form);
        setUiAlert({
          msg: "Evento registrado correctamente",
          type: "success",
        });
      } else {
        await updateSaludSitio3(editId, form);
        setUiAlert({
          msg: "Evento actualizado correctamente",
          type: "success",
        });
      }

      const data = await getSaludSitio3();
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
          Salud y Bienestar – Sitio 3
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
          Registrar Evento Salud/Bienestar
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
                <th>Lote</th>
                <th>Evento</th>
                <th>Tratamiento</th>
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
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.lote}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.evento}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.tratamiento}
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
              {!registros.length && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 12, fontSize: 14 }}
                  >
                    Sin eventos registrados
                  </td>
                </tr>
              )}
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
            {editId === null ? "Registrar Evento" : "Editar Evento"}
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
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Evento/Problema"
                value={form.evento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, evento: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Tratamiento/Acciones"
                value={form.tratamiento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tratamiento: e.target.value }))
                }
                fullWidth
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
