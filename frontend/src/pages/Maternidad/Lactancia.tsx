// src/pages/Maternidad/Lactancia.tsx
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
} from "@mui/material";
import {
  getControles,
  addControl,
  updateControl,
  deleteControl,
  ControlLactancia,
} from "../../services/maternidad/Lactancia";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const emptyForm: Omit<ControlLactancia, "id"> = {
  fecha: "",
  identificacionMadre: "",
  numeroLechones: 0,
  consumoAlimentoKg: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Lactancia() {
  const [controles, setControles] = useState<ControlLactancia[]>([]);
  const [form, setForm] = useState<Omit<ControlLactancia, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // Madres para búsqueda inteligente
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [filtroMadre, setFiltroMadre] = useState("");

  useEffect(() => {
    (async () => {
      const [dataControles, dataMadres] = await Promise.all([
        getControles(),
        getMadres(),
      ]);
      setControles(dataControles);
      setMadres(dataMadres);
    })();
  }, []);

  const limpiarForm = () => {
    setForm(emptyForm);
    setFiltroMadre("");
  };

  const recargarControles = async () => {
    const data = await getControles();
    setControles(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.identificacionMadre) {
        setUiAlert({
          msg: "Debes completar identificación y fecha",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateControl(editId, form);
        setUiAlert({
          msg: "Control de lactancia actualizado correctamente",
          type: "success",
        });
      } else {
        await addControl(form);
        setUiAlert({
          msg: "Control de lactancia registrado correctamente",
          type: "success",
        });
      }
      await recargarControles();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const control = controles.find((c) => c.id === id);
    if (control) {
      const { id: _id, ...rest } = control;
      setForm(rest);
      setFiltroMadre(rest.identificacionMadre);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteControl(id);
    await recargarControles();
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  const madresFiltradas = madres.filter((m) =>
    (m.identificacion + " " + (m.raza || "") + " " + (m.lote || ""))
      .toLowerCase()
      .includes(filtroMadre.toLowerCase())
  );

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Control de Lactancia
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
          Registrar Control
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
                <th>ID Madre</th>
                <th>N° Lechones</th>
                <th>Consumo Alimento (Kg)</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {controles.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.identificacionMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.numeroLechones}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {c.consumoAlimentoKg}
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
                        mr: 1,
                      }}
                      onClick={() => handleEditar(c.id)}
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
                      onClick={() => handleEliminar(c.id)}
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
            {editId ? "Editar Control" : "Registrar Control"}
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
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
              />
              {/* Búsqueda inteligente de madre */}
              <Box sx={{ position: "relative", minWidth: 220 }}>
                <TextField
                  label="Identificación Madre"
                  value={filtroMadre}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFiltroMadre(value);
                    setForm((f) => ({
                      ...f,
                      identificacionMadre: value,
                    }));
                  }}
                  fullWidth
                />
                {filtroMadre && madresFiltradas.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      zIndex: 10,
                      top: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: 200,
                      overflowY: "auto",
                      bgcolor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    {madresFiltradas.map((m) => (
                      <Box
                        key={m.id}
                        sx={{
                          px: 1,
                          py: 0.5,
                          fontSize: 13,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            identificacionMadre: m.identificacion,
                          }));
                          setFiltroMadre(m.identificacion);
                        }}
                      >
                        {m.identificacion} — {m.raza || "Sin raza"} — Lote{" "}
                        {m.lote || "-"}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <TextField
                label="N° Lechones"
                type="number"
                value={form.numeroLechones}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    numeroLechones: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Consumo Alimento (Kg)"
                type="number"
                value={form.consumoAlimentoKg}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    consumoAlimentoKg: Number(e.target.value) || 0,
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
