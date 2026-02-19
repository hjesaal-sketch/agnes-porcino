// src/pages/Maternidad/Ingreso.tsx
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
  Autocomplete,
} from "@mui/material";
import {
  getIngresos,
  addIngreso,
  updateIngreso,
  deleteIngreso,
  IngresoMaternidad,
} from "../../services/maternidad/Ingreso";
import {
  getMadres,
  MadreGestante,
} from "../../services/gestacion/Madres";

const motivoOptions = ["Gestación", "Parto", "Observación", "Otro"] as const;

const emptyForm: Omit<IngresoMaternidad, "id"> = {
  fechaIngreso: "",
  identificacionMadre: "",
  lote: "",
  raza: "",
  ageMeses: 0,
  motivoIngreso: "Gestación",
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Ingreso() {
  const [ingresos, setIngresos] = useState<IngresoMaternidad[]>([]);
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [form, setForm] = useState<Omit<IngresoMaternidad, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ing, ms] = await Promise.all([getIngresos(), getMadres()]);
        setIngresos(ing);
        setMadres(ms);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar ingresos",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargarIngresos = async () => {
    const data = await getIngresos();
    setIngresos(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fechaIngreso || !form.identificacionMadre) {
        setUiAlert({
          msg: "Debes completar identificación y fecha",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateIngreso(editId, form);
        setUiAlert({
          msg: "Ingreso actualizado correctamente",
          type: "success",
        });
      } else {
        await addIngreso(form);
        setUiAlert({
          msg: "Ingreso registrado correctamente",
          type: "success",
        });
      }
      await recargarIngresos();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const ingreso = ingresos.find((i) => i.id === id);
    if (ingreso) {
      const { id: _id, ...rest } = ingreso;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteIngreso(id);
    await recargarIngresos();
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  // Cuando cambia la identificación en el form (por autocomplete o edición),
  // autocompletar raza, lote y edad con los datos de la madre si existe.
  useEffect(() => {
    if (!form.identificacionMadre) return;
    const madre = madres.find(
      (m) => m.identificacion === form.identificacionMadre
    );
    if (madre) {
      setForm((f) => ({
        ...f,
        raza: madre.raza || f.raza,
        lote: madre.lote || f.lote,
        ageMeses: madre.edadMeses || f.ageMeses,
      }));
    }
  }, [form.identificacionMadre, madres]);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registro de Ingreso a Maternidad
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
          Registrar Ingreso
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
                <th>Lote</th>
                <th>Raza</th>
                <th>Edad (meses)</th>
                <th>Motivo</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((i) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.fechaIngreso}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.identificacionMadre}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.lote}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.raza}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.ageMeses}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.motivoIngreso}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {i.observaciones}
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
                      onClick={() => handleEditar(i.id)}
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
                      onClick={() => handleEliminar(i.id)}
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
            {editId ? "Editar Ingreso" : "Registrar Ingreso"}
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
                label="Fecha Ingreso"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaIngreso}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaIngreso: e.target.value }))
                }
              />
              <Autocomplete
                options={madres}
                getOptionLabel={(option) => option.identificacion}
                filterOptions={(options, state) =>
                  options.filter((o) =>
                    o.identificacion
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
                value={
                  madres.find(
                    (m) => m.identificacion === form.identificacionMadre
                  ) || null
                }
                onChange={(_, value) =>
                  setForm((f) => ({
                    ...f,
                    identificacionMadre: value?.identificacion || "",
                  }))
                }
                inputValue={form.identificacionMadre}
                onInputChange={(_, value) =>
                  setForm((f) => ({ ...f, identificacionMadre: value }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Identificación Madre" />
                )}
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Raza"
                value={form.raza}
                onChange={(e) =>
                  setForm((f) => ({ ...f, raza: e.target.value }))
                }
              />
              <TextField
                label="Edad (meses)"
                type="number"
                value={form.ageMeses}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ageMeses: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Motivo"
                select
                value={form.motivoIngreso}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    motivoIngreso:
                      e.target.value as IngresoMaternidad["motivoIngreso"],
                  }))
                }
              >
                {motivoOptions.map((op) => (
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
