// src/pages/Maternidad/Destete.tsx
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
  getRegistrosDestete,
  addDestete,
  updateDestete,
  deleteDestete,
  DesteteMaternidad,
} from "../../services/maternidad/Destete";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const destinoOptions = ["Sitio 2", "Sitio 3", "Venta", "Otro"] as const;

const emptyForm: Omit<DesteteMaternidad, "id"> = {
  fecha: "",
  identificacionMadre: "",
  lechonesDestetados: 0,
  pesoTotalKg: 0,
  destino: "Sitio 3",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Destete() {
  const [registros, setRegistros] = useState<DesteteMaternidad[]>([]);
  const [form, setForm] = useState<Omit<DesteteMaternidad, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // Madres para búsqueda inteligente
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [filtroMadre, setFiltroMadre] = useState("");

  useEffect(() => {
    (async () => {
      const [dataRegistros, dataMadres] = await Promise.all([
        getRegistrosDestete(),
        getMadres(),
      ]);
      setRegistros(normalizarDestetes(dataRegistros));
      setMadres(dataMadres);
    })();
  }, []);

  const normalizarDestetes = (data: any[]): DesteteMaternidad[] => {
    return data.map((d) => ({
      id: d.id,
      empresa_id: d.empresa_id,
      granja_id: d.granja_id,
      fecha: d.fecha,
      identificacionMadre: d.identificacion_madre || d.identificacionMadre,
      lechonesDestetados: d.lechones_destetados || d.lechonesDestetados,
      pesoTotalKg: d.peso_total_kg || d.pesoTotalKg,
      destino: d.destino,
      responsable: d.responsable,
      observaciones: d.observaciones,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  };

  const limpiarForm = () => {
    setForm(emptyForm);
    setFiltroMadre("");
  };

  const recargarRegistros = async () => {
    const data = await getRegistrosDestete();
    setRegistros(normalizarDestetes(data));
  };

  const handleGuardar = async () => {
    try {
      if (
        !form.fecha ||
        !form.identificacionMadre ||
        form.lechonesDestetados < 1
      ) {
        setUiAlert({
          msg: "Completa todos los campos obligatorios",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateDestete(editId, form);
        setUiAlert({
          msg: "Registro actualizado correctamente",
          type: "success",
        });
      } else {
        await addDestete(form);
        setUiAlert({
          msg: "Destete registrado correctamente",
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
    await deleteDestete(id);
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
          Destete y Movimientos de Lechones
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
          Registrar Destete
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
                <th>Lechones Destetados</th>
                <th>Peso Total (kg)</th>
                <th>Destino</th>
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
                    {r.lechonesDestetados}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.pesoTotalKg}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.destino}
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
            {editId ? "Editar Destete" : "Registrar Destete"}
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
                label="Lechones Destetados"
                type="number"
                value={form.lechonesDestetados}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lechonesDestetados: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Peso Total (kg)"
                type="number"
                value={form.pesoTotalKg}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pesoTotalKg: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Destino"
                select
                value={form.destino}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    destino: e.target.value as DesteteMaternidad["destino"],
                  }))
                }
              >
                {destinoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
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
