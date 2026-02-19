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
  getMadres,
  addMadre,
  updateMadre,
  deleteMadre,
  MadreGestante,
} from "../../services/gestacion/Madres";

const estadoOptions = ["Gestante", "Vacía", "Parida", "Reemplazo"] as const;

// IMPORTANTE: MadreGestante debe tener fechaNacimiento: string
const emptyForm: Omit<MadreGestante, "id"> = {
  fechaIngreso: "",
  identificacion: "",
  raza: "",
  fechaNacimiento: "",
  edadMeses: 0,
  lote: "",
  estado: "Gestante",
  observaciones: "",
  paridad: 0,
  causa_baja: null,
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

// util para calcular edad en meses
function calcularEdadMeses(fechaNac: string, fechaRef: string): number {
  if (!fechaNac || !fechaRef) return 0;
  const fNac = new Date(fechaNac);
  const fRef = new Date(fechaRef);
  if (Number.isNaN(fNac.getTime()) || Number.isNaN(fRef.getTime())) return 0;

  let meses = (fRef.getFullYear() - fNac.getFullYear()) * 12;
  meses += fRef.getMonth() - fNac.getMonth();

  // ajustar por día del mes
  if (fRef.getDate() < fNac.getDate()) {
    meses -= 1;
  }

  return meses < 0 ? 0 : meses;
}

export default function RegistroMadres() {
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [form, setForm] = useState<Omit<MadreGestante, "id">>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // estado para la barra de búsqueda
  const [searchId, setSearchId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMadres();
        setMadres(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar madres",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const recargarMadres = async () => {
    const data = await getMadres();
    setMadres(data);
  };

  const handleGuardar = async () => {
    try {
      if (!form.fechaIngreso || !form.identificacion) {
        setUiAlert({
          msg: "Debes completar identificación y fecha de ingreso",
          type: "error",
        });
        return;
      }

      if (!form.fechaNacimiento) {
        setUiAlert({
          msg: "Debes indicar la fecha de nacimiento de la madre",
          type: "error",
        });
        return;
      }

      // recalcular edadMeses antes de enviar, por si acaso
      const edadMeses = calcularEdadMeses(
        form.fechaNacimiento,
        form.fechaIngreso
      );

      const payload: Omit<MadreGestante, "id"> = {
        ...form,
        edadMeses,
        paridad: form.paridad ?? 0,
        causa_baja: form.causa_baja ?? null,
      };

      if (editId !== null) {
        await updateMadre(editId, payload);
        setUiAlert({
          msg: "Registro actualizado correctamente",
          type: "success",
        });
      } else {
        await addMadre(payload);
        setUiAlert({
          msg: "Madre registrada correctamente",
          type: "success",
        });
      }

      await recargarMadres();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error inesperado", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const madre = madres.find((m) => m.id === id);
    if (madre) {
      const { id: _id, ...rest } = madre;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteMadre(id);
      await recargarMadres();
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al eliminar registro",
        type: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setUiAlert(null);
  };

  // recalcular edadMeses cuando cambie fechaIngreso o fechaNacimiento
  const handleChangeFechaIngreso = (value: string) => {
    setForm((f) => ({
      ...f,
      fechaIngreso: value,
      edadMeses: calcularEdadMeses(f.fechaNacimiento, value),
    }));
  };

  const handleChangeFechaNacimiento = (value: string) => {
    setForm((f) => ({
      ...f,
      fechaNacimiento: value,
      edadMeses: calcularEdadMeses(value, f.fechaIngreso),
    }));
  };

  // aplicar filtro local por identificación (case-insensitive, contiene)
  const madresFiltradas = madres.filter((m) => {
    if (!searchId.trim()) return true;
    return m.identificacion
      .toLowerCase()
      .includes(searchId.trim().toLowerCase());
  });

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Registro de Madres Gestantes
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            sx={{ bgcolor: "#169b62" }}
            onClick={() => {
              setShowDialog(true);
              limpiarForm();
              setEditId(null);
            }}
          >
            Registrar Madre
          </Button>

          <TextField
            label="Buscar por ID madre"
            size="small"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            sx={{ minWidth: 220 }}
            placeholder="Escribe la identificación..."
          />
        </Box>

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
                <th>ID</th>
                <th>Raza</th>
                <th>Edad</th>
                <th>Lote</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {madresFiltradas.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.fechaIngreso}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.identificacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.raza}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.edadMeses}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.lote}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.estado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {m.observaciones}
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
                      onClick={() => handleEditar(m.id)}
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
                      onClick={() => handleEliminar(m.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {madresFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: 12,
                      fontSize: 14,
                      color: "#666",
                    }}
                  >
                    No se encontraron madres con ese ID.
                  </td>
                </tr>
              )}
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
            {editId !== null ? "Editar Madre" : "Registrar Madre"}
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
                label="Fecha Ingreso"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaIngreso}
                onChange={(e) => handleChangeFechaIngreso(e.target.value)}
              />
              <TextField
                label="Identificación"
                value={form.identificacion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, identificacion: e.target.value }))
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
                label="Fecha nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaNacimiento}
                onChange={(e) => handleChangeFechaNacimiento(e.target.value)}
              />
              <TextField
                label="Edad (meses)"
                type="number"
                value={form.edadMeses}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Estado"
                select
                SelectProps={{ native: true }}
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estado: e.target.value as MadreGestante["estado"],
                  }))
                }
              >
                {estadoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
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
