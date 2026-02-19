// src/pages/Genetica/Reproductores.tsx
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
  getVerracos,
  addVerraco,
  updateVerraco,
  deleteVerraco,
  Verraco,
  NuevoVerraco,
} from "../../services/genetica/Reproductores";

const estadoOptions: Verraco["estadoReproductivo"][] = ["Activo", "Reposo", "Baja"];

const emptyForm: NuevoVerraco = {
  identificacion: "",
  raza: "",
  fechaNacimiento: "",
  origen: "",
  padre: "",
  madre: "",
  peso: 0,
  estadoReproductivo: "Activo",
  salud: "",
  valorGenetico: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Reproductores() {
  const [verracos, setVerracos] = useState<Verraco[]>([]);
  const [form, setForm] = useState<NuevoVerraco>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getVerracos();
      setVerracos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.identificacion || !form.raza || !form.fechaNacimiento) {
        setUiAlert({
          msg: "Completa identificación, raza y fecha de nacimiento",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateVerraco(editId, form);
        setUiAlert({
          msg: "Verraco actualizado correctamente",
          type: "success",
        });
      } else {
        await addVerraco(form);
        setUiAlert({
          msg: "Verraco registrado correctamente",
          type: "success",
        });
      }
      const data = await getVerracos();
      setVerracos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const v = verracos.find((x) => x.id === id);
    if (v) {
      const { id: _id, ...rest } = v;
      setForm(rest);
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteVerraco(id);
    const data = await getVerracos();
    setVerracos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reproductores (Verracos del Plantel)
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
          Registrar Verraco
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
              <tr style={{ background: "#169b62", color: "#fff", height: 33 }}>
                <th>ID Verraco</th>
                <th>Raza</th>
                <th>F. Nac.</th>
                <th>Origen</th>
                <th>Peso (kg)</th>
                <th>Estado Reprod.</th>
                <th>Salud</th>
                <th>Valor Genético</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {verracos.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.identificacion}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.raza}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.fechaNacimiento}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.origen}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.peso}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.estadoReproductivo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{v.salud}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.valorGenetico}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {v.observaciones}
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
                      onClick={() => handleEditar(v.id)}
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
                      onClick={() => handleEliminar(v.id)}
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
            {editId ? "Editar Verraco" : "Registrar Verraco"}
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
                label="ID Verraco"
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
                label="Fecha Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fechaNacimiento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))
                }
              />
              <TextField
                label="Origen (compra / cría)"
                value={form.origen}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origen: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Padre"
                value={form.padre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, padre: e.target.value }))
                }
              />
              <TextField
                label="Madre"
                value={form.madre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, madre: e.target.value }))
                }
              />
              <TextField
                label="Peso (kg)"
                type="number"
                value={form.peso}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    peso: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Estado Reproductivo"
                select
                value={form.estadoReproductivo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estadoReproductivo:
                      e.target.value as Verraco["estadoReproductivo"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {estadoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Salud"
                value={form.salud}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salud: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Valor Genético"
                value={form.valorGenetico}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valorGenetico: e.target.value }))
                }
                fullWidth
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
