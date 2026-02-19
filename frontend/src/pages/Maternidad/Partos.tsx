// src/pages/Maternidad/Partos.tsx
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
  getPartos,
  addParto,
  updateParto,
  deleteParto,
  PartoMaternidad,
} from "../../services/maternidad/Partos";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const emptyForm: Omit<PartoMaternidad, "id"> = {
  fechaParto: "",
  identificacionMadre: "",
  nacidosVivos: 0,
  nacidosMuertos: 0,
  lechonesViables: 0,
  pesoTotal: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Partos() {
  const [partos, setPartos] = useState<PartoMaternidad[]>([]);
  const [form, setForm] = useState<Omit<PartoMaternidad, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // madres para búsqueda inteligente
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [filtroMadre, setFiltroMadre] = useState("");

  useEffect(() => {
    (async () => {
      const [dataPartos, dataMadres] = await Promise.all([
        getPartos(),
        getMadres(),
      ]);
      setPartos(dataPartos);
      setMadres(dataMadres);
    })();
  }, []);

  const limpiarForm = () => {
    setForm(emptyForm);
    setFiltroMadre("");
  };

  const recargarPartos = async () => {
    const data = await getPartos();
    setPartos(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fechaParto || !form.identificacionMadre) {
        setUiAlert({
          msg: "Debes completar identificación y fecha de parto",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateParto(editId, form);
        setUiAlert({
          msg: "Parto actualizado correctamente",
          type: "success",
        });
      } else {
        await addParto(form);
        setUiAlert({
          msg: "Parto registrado correctamente",
          type: "success",
        });
      }
      await recargarPartos();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const parto = partos.find((p) => p.id === id);
    if (parto) {
      const { id: _id, ...rest } = parto;
      setForm(rest);
      setFiltroMadre(rest.identificacionMadre);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteParto(id);
    await recargarPartos();
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  // madres filtradas según lo que teclea el usuario
  const madresFiltradas = madres.filter((m) =>
    (m.identificacion + " " + (m.raza || "") + " " + (m.lote || ""))
      .toLowerCase()
      .includes(filtroMadre.toLowerCase())
  );

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registro de Partos y Nacidos
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
          Registrar Parto
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
                <th>Nac. Vivos</th>
                <th>Nac. Muertos</th>
                <th>Lechones Viables</th>
                <th>Peso Total</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {partos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.fechaParto}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.identificacionMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.nacidosVivos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.nacidosMuertos}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.lechonesViables}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.pesoTotal}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {p.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
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
            {editId ? "Editar Parto" : "Registrar Parto"}
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
                label="Fecha Parto"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaParto}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaParto: e.target.value }))
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
                label="Nacidos Vivos"
                type="number"
                value={form.nacidosVivos}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nacidosVivos: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Nacidos Muertos"
                type="number"
                value={form.nacidosMuertos}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nacidosMuertos: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Lechones Viables"
                type="number"
                value={form.lechonesViables}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lechonesViables: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Peso Total"
                type="number"
                value={form.pesoTotal}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pesoTotal: Number(e.target.value) || 0,
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
