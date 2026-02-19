// src/pages/Gestacion/IndiceGrasaDorsal.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert as MuiAlert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getMadres, MadreGestante } from "../../services/gestacion/Madres";
import {
  EtapaBackfat,
  MedicionIGDorsal,
  NuevaMedicionIGDorsal,
  getMedicionesIGDorsalPorCerda,
  addMedicionIGDorsal,
  updateMedicionIGDorsal,
  deleteMedicionIGDorsal,
} from "../../services/gestacion/IndiceGrasaDorsal";

const EMPRESA_ID = 1;

type UiAlertState = {
  msg: string;
  type: "success" | "error";
} | null;

const etapas: { value: EtapaBackfat; label: string }[] = [
  { value: "gestacion", label: "Gestación" },
  { value: "lactancia", label: "Lactancia" },
  { value: "reposo", label: "Reposo" },
  { value: "reemplazo", label: "Reemplazo" },
];

const emptyForm: Omit<NuevaMedicionIGDorsal, "empresa_id" | "sow_id"> = {
  fecha_medicion: "",
  valor_mm: 0,
  equipo: "",
  usuario: "",
  etapa: "gestacion",
  observaciones: "",
};

// Rangos óptimos por etapa (mm)
const RANGOS_ETAPA: Record<
  EtapaBackfat,
  { min: number; max: number }
> = {
  gestacion: { min: 15, max: 20 },
  lactancia: { min: 13, max: 17 },
  reposo: { min: 14, max: 18 },
  reemplazo: { min: 14, max: 18 },
};

type ClasificacionIGD = "bajo" | "ok" | "alto";

function clasificarIGD(etapa: EtapaBackfat, valor: number): ClasificacionIGD {
  const rangos = RANGOS_ETAPA[etapa] ?? RANGOS_ETAPA.gestacion;
  if (valor < rangos.min) return "bajo";
  if (valor > rangos.max) return "alto";
  return "ok";
}

function getChipProps(
  etapa: EtapaBackfat,
  valor: number
): { label: string; color: "success" | "warning" | "error" } {
  const clasif = clasificarIGD(etapa, valor);
  if (clasif === "bajo") {
    return { label: "Déficit", color: "error" };
  }
  if (clasif === "alto") {
    return { label: "Exceso", color: "warning" };
  }
  return { label: "Óptimo", color: "success" };
}

export default function IndiceGrasaDorsal() {
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [madreSeleccionada, setMadreSeleccionada] =
    useState<MadreGestante | null>(null);

  const [mediciones, setMediciones] = useState<MedicionIGDorsal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);

  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    const cargarMadres = async () => {
      try {
        const data = await getMadres();
        setMadres(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar madres",
          type: "error",
        });
      }
    };
    cargarMadres();
  }, []);

  useEffect(() => {
    const cargarMediciones = async () => {
      if (!madreSeleccionada) {
        setMediciones([]);
        return;
      }
      try {
        const data = await getMedicionesIGDorsalPorCerda({
          empresaId: EMPRESA_ID,
          sowId: madreSeleccionada.id,
        });
        setMediciones(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar mediciones de I. G. Dorsal",
          type: "error",
        });
      }
    };
    cargarMediciones();
  }, [madreSeleccionada]);

  const limpiarForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleGuardar = async () => {
    if (!madreSeleccionada) {
      setUiAlert({
        msg: "Selecciona una madre antes de registrar I. G. Dorsal.",
        type: "error",
      });
      return;
    }
    if (!form.fecha_medicion || !form.valor_mm) {
      setUiAlert({
        msg: "Completa fecha de medición y valor en mm.",
        type: "error",
      });
      return;
    }

    try {
      if (editId !== null) {
        const updated = await updateMedicionIGDorsal(editId, {
          empresa_id: EMPRESA_ID,
          fecha_medicion: form.fecha_medicion,
          valor_mm: form.valor_mm,
          equipo: form.equipo,
          usuario: form.usuario,
          etapa: form.etapa,
          observaciones: form.observaciones,
        });
        setMediciones((prev) =>
          prev.map((m) => (m.id === editId ? updated : m))
        );
        setUiAlert({
          msg: "Medición de I. G. Dorsal actualizada correctamente.",
          type: "success",
        });
      } else {
        const created = await addMedicionIGDorsal({
          empresa_id: EMPRESA_ID,
          sow_id: madreSeleccionada.id,
          fecha_medicion: form.fecha_medicion,
          valor_mm: form.valor_mm,
          equipo: form.equipo,
          usuario: form.usuario,
          etapa: form.etapa,
          observaciones: form.observaciones,
        });
        setMediciones((prev) => [...prev, created]);
        setUiAlert({
          msg: "Medición de I. G. Dorsal registrada correctamente.",
          type: "success",
        });
      }
      limpiarForm();
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al guardar medición de I. G. Dorsal",
        type: "error",
      });
    }
  };

  const handleEditar = (med: MedicionIGDorsal) => {
    setEditId(med.id);
    setForm({
      fecha_medicion: med.fecha_medicion,
      valor_mm: med.valor_mm,
      equipo: med.equipo,
      usuario: med.usuario,
      etapa: med.etapa,
      observaciones: med.observaciones || "",
    });
  };

  const handleEliminar = async (id: number) => {
    if (!madreSeleccionada) return;
    try {
      await deleteMedicionIGDorsal({
        id,
        empresaId: EMPRESA_ID,
      });
      setMediciones((prev) => prev.filter((m) => m.id !== id));
      setUiAlert({
        msg: "Medición de I. G. Dorsal eliminada correctamente.",
        type: "success",
      });
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al eliminar medición de I. G. Dorsal",
        type: "error",
      });
    }
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          I. G. Dorsal – Condición corporal por cerda
        </Typography>

        {/* Selección de madre */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Autocomplete
            options={madres}
            getOptionLabel={(m) =>
              `${m.identificacion} – Lote ${m.lote || "-"}`
            }
            value={madreSeleccionada}
            onChange={(_, value) => {
              setMadreSeleccionada(value);
              limpiarForm();
            }}
            renderInput={(params) => (
              <TextField {...params} label="Madre" sx={{ minWidth: 260 }} />
            )}
            sx={{ minWidth: 260 }}
          />
        </Box>

        {/* Formulario de medición */}
        <Box
          sx={{
            border: 1,
            borderColor: "grey.300",
            borderRadius: 1,
            p: 2,
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <TextField
            label="Fecha de medición"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.fecha_medicion}
            onChange={(e) =>
              setForm((f) => ({ ...f, fecha_medicion: e.target.value }))
            }
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Valor (mm)"
            type="number"
            value={form.valor_mm}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                valor_mm: Number(e.target.value || 0),
              }))
            }
            sx={{ minWidth: 140 }}
          />
          <TextField
            select
            label="Etapa"
            value={form.etapa}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                etapa: e.target.value as EtapaBackfat,
              }))
            }
            sx={{ minWidth: 160 }}
          >
            {etapas.map((op) => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Equipo"
            value={form.equipo}
            onChange={(e) =>
              setForm((f) => ({ ...f, equipo: e.target.value }))
            }
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Operario"
            value={form.usuario}
            onChange={(e) =>
              setForm((f) => ({ ...f, usuario: e.target.value }))
            }
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm((f) => ({ ...f, observaciones: e.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
          />
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#169b62" }}
              onClick={handleGuardar}
            >
              {editId !== null ? "Actualizar" : "Registrar"} I. G. Dorsal
            </Button>
            <Button variant="outlined" onClick={limpiarForm}>
              Limpiar
            </Button>
          </Box>
        </Box>

        {/* Tabla de mediciones */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Etapa</TableCell>
                <TableCell align="right">Valor (mm)</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell>Operario</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mediciones.map((m) => {
                const chip = getChipProps(m.etapa as EtapaBackfat, m.valor_mm);
                return (
                  <TableRow key={m.id}>
                    <TableCell>{m.fecha_medicion}</TableCell>
                    <TableCell>
                      {etapas.find((e) => e.value === m.etapa)?.label ||
                        m.etapa}
                    </TableCell>
                    <TableCell align="right">{m.valor_mm}</TableCell>
                    <TableCell>
                      <Chip
                        label={chip.label}
                        color={chip.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{m.equipo}</TableCell>
                    <TableCell>{m.usuario}</TableCell>
                    <TableCell>{m.observaciones}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditar(m)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleEliminar(m.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {mediciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {madreSeleccionada
                      ? "Sin mediciones registradas para esta madre."
                      : "Selecciona una madre para ver sus mediciones de I. G. Dorsal."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </CardContent>

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
    </Card>
  );
}
