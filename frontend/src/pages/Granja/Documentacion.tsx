// src/pages/Granja/Documentacion.tsx
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
  getDocumentos,
  addDocumento,
  updateDocumento,
  deleteDocumento,
  Documento,
  NuevoDocumento,
} from "../../services/granja/Documentacion";

const tipoOptions = [
  "Permiso",
  "Licencia",
  "Auditoría",
  "Certificado",
  "Manual",
  "Otro",
] as const;

const estadoOptions = ["Vigente", "Vencido", "Pendiente"] as const;

const emptyForm: NuevoDocumento = {
  fecha: "",
  tipo: "Permiso",
  titulo: "",
  descripcion: "",
  responsable: "",
  estado: "Vigente",
  observaciones: "",
  file_url: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Documentacion() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [form, setForm] = useState<NuevoDocumento>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDocumentos();
        setDocumentos(data);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al obtener documentos",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.titulo || !form.tipo || !form.fecha) {
        setUiAlert({
          msg: "Completa tipo, título y fecha",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateDocumento(editId, form);
        setUiAlert({
          msg: "Documento actualizado correctamente",
          type: "success",
        });
      } else {
        await addDocumento(form);
        setUiAlert({
          msg: "Documento registrado correctamente",
          type: "success",
        });
      }
      const data = await getDocumentos();
      setDocumentos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const doc = documentos.find((d) => d.id === id);
    if (doc) {
      const { id: _id, ...rest } = doc;
      setForm({
        ...rest,
        file_url: rest.file_url ?? "",
      });
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteDocumento(id);
      const data = await getDocumentos();
      setDocumentos(data);
      setUiAlert({ msg: "Registro eliminado", type: "success" });
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error", type: "error" });
    }
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 1150, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Documentación, Permisos, Licencias y Auditorías
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
          Registrar Documento
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
                <th>Tipo</th>
                <th>Título</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Archivo / Enlace</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.tipo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.titulo}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.fecha}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.estado}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.file_url}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {d.observaciones}
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
                      onClick={() => handleEditar(d.id)}
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
                      onClick={() => handleEliminar(d.id)}
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
            {editId ? "Editar Documento" : "Registrar Documento"}
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
                label="Tipo"
                select
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo: e.target.value as (typeof tipoOptions)[number],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {tipoOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Título"
                value={form.titulo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titulo: e.target.value }))
                }
                sx={{ minWidth: 260 }}
              />
              <TextField
                label="Responsable"
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="Estado"
                select
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estado: e.target.value as (typeof estadoOptions)[number],
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
                label="Enlace / Archivo (URL)"
                value={form.file_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, file_url: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
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
