// src/pages/Sitio3/Mortalidad.tsx
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
  getMortalidadSitio3,
  addMortalidadSitio3,
  updateMortalidadSitio3,
  RegistroMortalidad3,
  NuevoRegistroMortalidad3,
} from "../../services/sitio3/Mortalidad";

const emptyForm: NuevoRegistroMortalidad3 = {
  fecha: "",
  lote: "",
  corral: "",
  cantidad: 0,
  causa: "",
  tipo: "Mortalidad",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio3Mortalidad() {
  const [registros, setRegistros] = useState<RegistroMortalidad3[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevoRegistroMortalidad3>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMortalidadSitio3();
        setRegistros(data);
      } catch (e: any) {
        setUiAlert({
          msg: e.message || "Error cargando mortalidad/descartes Sitio 3",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.lote || form.cantidad <= 0) {
        setUiAlert({
          msg: "Completa fecha, lote y cantidad (>0)",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addMortalidadSitio3(form);
        setUiAlert({
          msg: "Registro de baja agregado correctamente",
          type: "success",
        });
      } else {
        await updateMortalidadSitio3(editId, form);
        setUiAlert({
          msg: "Registro de baja actualizado correctamente",
          type: "success",
        });
      }

      const data = await getMortalidadSitio3();
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
          Mortalidad y Descartes – Sitio 3
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
          Registrar Baja/Descarte
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
                <th>Cantidad</th>
                <th>Causa</th>
                <th>Tipo</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.lote}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.corral}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.cantidad}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.causa}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.tipo}</td>
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
                    colSpan={9}
                    style={{ textAlign: "center", padding: 12, fontSize: 14 }}
                  >
                    Sin registros de mortalidad/descartes
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
            {editId === null ? "Registrar Baja/Descarte" : "Editar Registro"}
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
                label="Causa"
                value={form.causa}
                onChange={(e) =>
                  setForm((f) => ({ ...f, causa: e.target.value }))
                }
              />
              <TextField
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as NuevoRegistroMortalidad3["tipo"],
                  }))
                }
              >
                <MenuItem value="Mortalidad">Mortalidad</MenuItem>
                <MenuItem value="Descarte">Descarte</MenuItem>
              </TextField>
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
