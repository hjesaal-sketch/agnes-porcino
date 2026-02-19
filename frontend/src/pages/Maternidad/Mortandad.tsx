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
  getRegistrosMortalidad,
  addMortalidad,
  updateMortalidad,
  deleteMortalidad,
  MortalidadMaternidad,
} from "../../services/maternidad/Mortandad";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const tipoOptions = ["Madre", "Lechón"] as const;

const emptyForm: Omit<MortalidadMaternidad, "id"> = {
  fecha: "",
  identificacionMadre: "",
  tipo: "Lechón",
  causa: "",
  cantidad: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Mortandad() {
  const [registros, setRegistros] = useState<MortalidadMaternidad[]>([]);
  const [form, setForm] = useState<Omit<MortalidadMaternidad, "id">>(
    emptyForm
  );
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // Madres para búsqueda inteligente
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [filtroMadre, setFiltroMadre] = useState("");

  useEffect(() => {
    (async () => {
      const [dataRegistros, dataMadres] = await Promise.all([
        getRegistrosMortalidad(),
        getMadres(),
      ]);
      setRegistros(dataRegistros);
      setMadres(dataMadres);
    })();
  }, []);

  const limpiarForm = () => {
    setForm(emptyForm);
    setFiltroMadre("");
  };

  const recargarRegistros = async () => {
    const data = await getRegistrosMortalidad();
    setRegistros(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.tipo || !form.causa || form.cantidad < 1) {
        setUiAlert({
          msg: "Completa fecha, tipo, causa y cantidad (mayor a cero)",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateMortalidad(editId, form);
        setUiAlert({
          msg: "Registro de mortalidad actualizado",
          type: "success",
        });
      } else {
        await addMortalidad(form);
        setUiAlert({
          msg: "Mortalidad registrada",
          type: "success",
        });
      }
      await recargarRegistros();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const reg = registros.find((r) => r.id === id);
    if (reg) {
      const { id: _id, ...rest } = reg;
      setForm(rest);
      setFiltroMadre(rest.identificacionMadre);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteMortalidad(id);
    await recargarRegistros();
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
          Mortalidad y Bajas
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
          Registrar Mortalidad
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
                <th>Tipo</th>
                <th>Causa</th>
                <th>Cantidad</th>
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
                    {r.identificacionMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.causa}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.cantidad}
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
                        mr: 1,
                      }}
                      onClick={() => handleEditar(r.id)}
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
                      onClick={() => handleEliminar(r.id)}
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
            {editId ? "Editar Mortalidad" : "Registrar Mortalidad"}
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 3,
            }}
          >
            {/* CONTENEDOR DEL FORMULARIO CON BORDE */}
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
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as MortalidadMaternidad["tipo"],
                  }))
                }
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Causa"
                value={form.causa}
                onChange={(e) =>
                  setForm((f) => ({ ...f, causa: e.target.value }))
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
