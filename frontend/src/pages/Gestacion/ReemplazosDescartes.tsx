// src/pages/Gestacion/ReemplazosDescartes.tsx
import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import {
  getMadres,
  addMadre,
  darBajaMadre,
  MadreGestante,
} from "../../services/gestacion/Madres";

type UiAlertState = { msg: string; type: "success" | "error" } | null;

type FormAltaPrimeriza = {
  identificacion: string;
  raza: string;
  lote: string;
  fechaIngreso: string;
  fechaNacimiento: string;
  observaciones: string;
};

type FormBaja = {
  causa_baja: string;
};

const emptyAlta: FormAltaPrimeriza = {
  identificacion: "",
  raza: "",
  lote: "",
  fechaIngreso: "",
  fechaNacimiento: "",
  observaciones: "",
};

const emptyBaja: FormBaja = {
  causa_baja: "",
};

export default function ReemplazosDescartes() {
  const navigate = useNavigate();

  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const [showAlta, setShowAlta] = useState(false);
  const [formAlta, setFormAlta] = useState<FormAltaPrimeriza>(emptyAlta);

  const [showBaja, setShowBaja] = useState(false);
  const [formBaja, setFormBaja] = useState<FormBaja>(emptyBaja);
  const [madreSeleccionada, setMadreSeleccionada] =
    useState<MadreGestante | null>(null);

  // Cargar madres
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

  const recargarMadres = async () => {
    const data = await getMadres();
    setMadres(data);
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  // ------- Alta de primerizas (Reemplazo) -------

  const abrirAlta = () => {
    setFormAlta(emptyAlta);
    setShowAlta(true);
  };

  const cerrarAlta = () => {
    setShowAlta(false);
    setFormAlta(emptyAlta);
  };

  const handleGuardarAlta = async () => {
    try {
      if (!formAlta.identificacion || !formAlta.fechaIngreso) {
        setUiAlert({
          msg: "Identificación y fecha de ingreso son obligatorias",
          type: "error",
        });
        return;
      }

      const payload = {
        id: 0,
        fechaIngreso: formAlta.fechaIngreso,
        identificacion: formAlta.identificacion,
        raza: formAlta.raza,
        fechaNacimiento: formAlta.fechaNacimiento || "",
        edadMeses: 0,
        lote: formAlta.lote,
        estado: "Reemplazo" as const,
        observaciones: formAlta.observaciones,
        paridad: 0,
        causa_baja: null,
      };

      await addMadre(payload);
      setUiAlert({
        msg: "Primeriza registrada como Reemplazo",
        type: "success",
      });
      await recargarMadres();
      cerrarAlta();
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al registrar reemplazo",
        type: "error",
      });
    }
  };

  // ------- Baja / Descarte -------

  const abrirBaja = (madre: MadreGestante) => {
    setMadreSeleccionada(madre);
    setFormBaja({
      causa_baja: madre.causa_baja ?? "",
    });
    setShowBaja(true);
  };

  const cerrarBaja = () => {
    setShowBaja(false);
    setMadreSeleccionada(null);
    setFormBaja(emptyBaja);
  };

  const handleConfirmarBaja = async () => {
    if (!madreSeleccionada) return;
    try {
      if (!formBaja.causa_baja.trim()) {
        setUiAlert({
          msg: "Debes indicar una causa de baja / descarte",
          type: "error",
        });
        return;
      }

      await darBajaMadre(madreSeleccionada.id, formBaja.causa_baja);

      setUiAlert({
        msg: `Madre ${madreSeleccionada.identificacion} marcada como baja`,
        type: "success",
      });
      await recargarMadres();
      cerrarBaja();
    } catch (err: any) {
      setUiAlert({
        msg: err?.message || "Error al registrar baja",
        type: "error",
      });
    }
  };

  // ------- Render -------

  const madresOrdenadas = [...madres].sort((a, b) =>
    a.identificacion.localeCompare(b.identificacion)
  );

  return (
    <>
      <Navbar
        isAuthenticated={true}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card sx={{ mb: 3, maxWidth: 1050, width: "100%" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reemplazos y Descartes de Madres
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="contained"
                sx={{ bgcolor: "#169b62" }}
                onClick={abrirAlta}
              >
                Dar de alta primeriza
              </Button>
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
                  <tr
                    style={{
                      background: "#169b62",
                      color: "#fff",
                      height: 41,
                    }}
                  >
                    <th>ID</th>
                    <th>Raza</th>
                    <th>Lote</th>
                    <th>Estado</th>
                    <th>Causa baja</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {madresOrdenadas.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ textAlign: "center", fontSize: 14 }}>
                        {m.identificacion}
                      </td>
                      <td style={{ textAlign: "center", fontSize: 14 }}>
                        {m.raza}
                      </td>
                      <td style={{ textAlign: "center", fontSize: 14 }}>
                        {m.lote}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontSize: 14,
                          color: m.estado === "Baja" ? "#b52424" : "#000",
                          fontWeight: m.estado === "Baja" ? 700 : 400,
                        }}
                      >
                        {m.estado}
                      </td>
                      <td style={{ textAlign: "center", fontSize: 14 }}>
                        {m.causa_baja ?? ""}
                      </td>
                      <td style={{ textAlign: "center" }}>
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
                          onClick={() => abrirBaja(m)}
                          disabled={m.estado === "Baja"}
                        >
                          Baja / Descarte
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {madresOrdenadas.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: 12,
                          fontSize: 14,
                          color: "#666",
                        }}
                      >
                        No hay madres registradas para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Diálogo alta primeriza */}
      <Dialog open={showAlta} onClose={cerrarAlta} maxWidth="md" fullWidth>
        <DialogTitle>Alta de madre primeriza (Reemplazo)</DialogTitle>
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
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <TextField
              label="Identificación"
              value={formAlta.identificacion}
              onChange={(e) =>
                setFormAlta((f) => ({ ...f, identificacion: e.target.value }))
              }
            />
            <TextField
              label="Fecha ingreso"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formAlta.fechaIngreso}
              onChange={(e) =>
                setFormAlta((f) => ({ ...f, fechaIngreso: e.target.value }))
              }
            />
            <TextField
              label="Raza"
              value={formAlta.raza}
              onChange={(e) =>
                setFormAlta((f) => ({ ...f, raza: e.target.value }))
              }
            />
            <TextField
              label="Lote"
              value={formAlta.lote}
              onChange={(e) =>
                setFormAlta((f) => ({ ...f, lote: e.target.value }))
              }
            />
            <TextField
              label="Fecha nacimiento"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formAlta.fechaNacimiento}
              onChange={(e) =>
                setFormAlta((f) => ({
                  ...f,
                  fechaNacimiento: e.target.value,
                }))
              }
            />
            <TextField
              label="Observaciones"
              value={formAlta.observaciones}
              onChange={(e) =>
                setFormAlta((f) => ({ ...f, observaciones: e.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleGuardarAlta}
            variant="contained"
            sx={{ bgcolor: "#169b62" }}
          >
            Guardar
          </Button>
          <Button onClick={cerrarAlta} variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo baja / descarte */}
      <Dialog open={showBaja} onClose={cerrarBaja} maxWidth="sm" fullWidth>
        <DialogTitle>
          Baja / descarte de madre{" "}
          {madreSeleccionada ? madreSeleccionada.identificacion : ""}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 3,
          }}
        >
          <TextField
            label="Causa de baja / descarte"
            value={formBaja.causa_baja}
            onChange={(e) =>
              setFormBaja((f) => ({ ...f, causa_baja: e.target.value }))
            }
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmarBaja}
            variant="contained"
            color="error"
          >
            Confirmar baja
          </Button>
          <Button onClick={cerrarBaja} variant="outlined">
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
    </>
  );
}
