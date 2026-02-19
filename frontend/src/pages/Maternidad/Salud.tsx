//frontend/src/pages/Maternidad/Salud
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
  Alert,
} from "@mui/material";
import {
  getRegistrosSalud,
  addSalud,
  updateSalud,
  deleteSalud,
  SaludMaternidad,
} from "../../services/maternidad/Salud";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const tipoPacienteOptions = ["Madre", "Lechones"] as const;
const eventoOptions = ["Vacunación", "Tratamiento", "Revisión", "Muestra", "Otro"] as const;

const emptyForm: Omit<SaludMaternidad, "id"> = {
  fecha: "",
  identificacionMadre: "",
  tipoPaciente: "Madre",
  evento: "Vacunación",
  descripcion: "",
  responsable: "",
  observaciones: "",
};

export default function MaternidadSalud() {
  const [registros, setRegistros] = useState<SaludMaternidad[]>([]);
  const [form, setForm] = useState<Omit<SaludMaternidad, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(
    null
  );

  // Madres para búsqueda inteligente
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [filtroMadre, setFiltroMadre] = useState("");

  useEffect(() => {
    (async () => {
      const [dataRegistros, dataMadres] = await Promise.all([
        getRegistrosSalud(),
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
    const data = await getRegistrosSalud();
    setRegistros(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.identificacionMadre || !form.evento) {
        setAlert({
          msg: "Debes completar todos los campos obligatorios",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateSalud(editId, form);
        setAlert({
          msg: "Registro de salud actualizado correctamente",
          type: "success",
        });
      } else {
        await addSalud(form);
        setAlert({
          msg: "Registro de salud agregado correctamente",
          type: "success",
        });
      }
      await recargarRegistros();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const reg = registros.find((r) => r.id === id);
    if (reg) {
      const { id: _id, ...resto } = reg;
      setForm(resto);
      setFiltroMadre(resto.identificacionMadre);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteSalud(id);
    await recargarRegistros();
    setAlert({ msg: "Registro eliminado", type: "success" });
  };

  const madresFiltradas = madres.filter((m) =>
    (m.identificacion + " " + (m.raza || "") + " " + (m.lote || ""))
      .toLowerCase()
      .includes(filtroMadre.toLowerCase())
  );

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Salud de Cerdas y Lechones
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
          Registrar Salud
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
                <th>Tipo Paciente</th>
                <th>Evento</th>
                <th>Descripción</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.identificacionMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.tipoPaciente}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.evento}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.descripcion}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.responsable}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.observaciones}</td>
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
            {editId ? "Editar Registro Salud" : "Registrar Salud"}
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
                label="Tipo Paciente"
                select
                value={form.tipoPaciente}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipoPaciente:
                      e.target.value as SaludMaternidad["tipoPaciente"],
                  }))
                }
                SelectProps={{ native: true }}
              >
                {tipoPacienteOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Evento"
                select
                value={form.evento}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    evento: e.target.value as SaludMaternidad["evento"],
                  }))
                }
                SelectProps={{ native: true }}
              >
                {eventoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
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
          open={!!alert}
          autoHideDuration={3200}
          onClose={() => setAlert(null)}
        >
          {alert ? (
            <Alert onClose={() => setAlert(null)} severity={alert.type}>
              {alert.msg}
            </Alert>
          ) : undefined}
        </Snackbar>
      </CardContent>
    </Card>
  );
}
