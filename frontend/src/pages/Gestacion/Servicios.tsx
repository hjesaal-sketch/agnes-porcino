// src/pages/Gestacion/Servicios.tsx

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
  getServicios,
  addServicio,
  updateServicio,
  deleteServicio,
  ServicioGestacion,
  SubServicioGestacion,
} from "../../services/gestacion/Servicios";
import { getMadres, MadreGestante } from "../../services/gestacion/Madres";

const tipoServicioOptions = [
  "Natural",
  "Inseminación",
  "Transferencia Embrionaria",
] as const;

// añadimos "Aborto"
const resultadoOptions = ["Pendiente", "Gestante", "Vacía", "Aborto"] as const;

type ResultadoServicio = ServicioGestacion["resultado"];

type SubServicioUI = {
  numero: number;
  fecha: string;
  tipoServicio: ServicioGestacion["tipoServicio"];
  verracoId: string;
  inseminador: string;
};

type FormState = ServicioGestacion & {
  subServiciosUI: SubServicioUI[];
};

const emptyFormBase: Omit<ServicioGestacion, "id"> & {
  subServiciosUI: SubServicioUI[];
} = {
  fecha: "",
  identificacionMadre: "",
  tipoServicio: "Natural",
  verracoId: "",
  resultado: "Pendiente",
  observaciones: "",
  subServicios: [],
  subServiciosUI: [
    {
      numero: 1,
      fecha: "",
      tipoServicio: "Natural",
      verracoId: "",
      inseminador: "",
    },
  ],
};

const makeEmptyForm = (): FormState => ({
  ...emptyFormBase,
  id: 0,
  subServiciosUI: [...emptyFormBase.subServiciosUI],
});

type UiAlertState = { msg: string; type: "success" | "error" } | null;

function getEstadoServicios(s: ServicioGestacion): string {
  const n = s.subServicios.length;
  if (n >= 2) return "Completo";
  if (n === 1) return "1 de 2";
  return "0 de 2";
}

export default function GestacionServicios() {
  const [servicios, setServicios] = useState<ServicioGestacion[]>([]);
  const [form, setForm] = useState<FormState>(makeEmptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // orden (más nuevos / más antiguos)
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");

  // madres y sugerencias para autocomplete
  const [madres, setMadres] = useState<MadreGestante[]>([]);
  const [sugerenciasMadres, setSugerenciasMadres] = useState<MadreGestante[]>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const dataServicios = await getServicios(orderDirection);
        setServicios(dataServicios);
      } catch (err: any) {
        setUiAlert({
          msg: err?.message || "Error al cargar servicios",
          type: "error",
        });
      }

      try {
        const dataMadres = await getMadres();
        setMadres(dataMadres);
      } catch {
        // sin sugerencias si falla
      }
    })();
  }, [orderDirection]);

  const limpiarForm = () => {
    setForm(makeEmptyForm());
    setSugerenciasMadres([]);
  };

  const recargarServicios = async () => {
    const data = await getServicios(orderDirection);
    setServicios(data);
  };

  const handleChangeMain = (
    field: keyof Omit<FormState, "id" | "subServicios" | "subServiciosUI">,
    value: string
  ) => {
    setForm((f) => ({ ...f, [field]: value } as FormState));
  };

  const handleChangeIdentificacion = (value: string) => {
    setForm((f) => ({ ...f, identificacionMadre: value }));
    const v = value.trim().toLowerCase();
    if (!v) {
      setSugerenciasMadres([]);
      return;
    }
    const filtradas = madres.filter((m) =>
      m.identificacion.toLowerCase().startsWith(v)
    );
    setSugerenciasMadres(filtradas.slice(0, 5));
  };

  const handleSelectMadre = (madre: MadreGestante) => {
    setForm((f) => ({ ...f, identificacionMadre: madre.identificacion }));
    setSugerenciasMadres([]);
  };

  const handleChangeSubUI = (
    index: number,
    field: keyof SubServicioUI,
    value: string
  ) => {
    setForm((f) => {
      const copia = [...f.subServiciosUI];
      if (!copia[index]) return f;
      copia[index] = { ...copia[index], [field]: value };
      return { ...f, subServiciosUI: copia };
    });
  };

  const handleAddSubServicioUI = () => {
    setForm((f) => {
      if (f.subServiciosUI.length >= 3) return f;
      const numero = f.subServiciosUI.length + 1;
      return {
        ...f,
        subServiciosUI: [
          ...f.subServiciosUI,
          {
            numero,
            fecha: "",
            tipoServicio: "Natural",
            verracoId: "",
            inseminador: "",
          },
        ],
      };
    });
  };

  const handleRemoveSubServicioUI = (index: number) => {
    setForm((f) => {
      const copia = [...f.subServiciosUI];
      if (!copia[index]) return f;
      copia.splice(index, 1);
      const reenumerados = copia.map((ss, i) => ({
        ...ss,
        numero: i + 1,
      }));
      return { ...f, subServiciosUI: reenumerados };
    });
  };

  const handleGuardar = async () => {
    try {
      if (!form.identificacionMadre) {
        setUiAlert({
          msg: "Debes completar los campos obligatorios",
          type: "error",
        });
        return;
      }

      const principal: SubServicioUI = form.subServiciosUI[0] || {
        numero: 1,
        fecha: form.fecha,
        tipoServicio: form.tipoServicio,
        verracoId: form.verracoId,
        inseminador: "",
      };

      const payload: Omit<ServicioGestacion, "id"> = {
        fecha: principal.fecha || form.fecha,
        identificacionMadre: form.identificacionMadre,
        tipoServicio: principal.tipoServicio || form.tipoServicio,
        verracoId: principal.verracoId || form.verracoId,
        resultado: form.resultado as ResultadoServicio,
        // SOLO lo que el usuario escribió, nada automático
        observaciones: form.observaciones,
        subServicios: form.subServiciosUI.map<SubServicioGestacion>((ui) => ({
          numero: ui.numero,
          fecha: ui.fecha,
          verracoId: ui.verracoId,
          inseminador: ui.inseminador,
        })),
      };

      if (editId !== null) {
        await updateServicio(editId, payload);
        setUiAlert({
          msg: "Servicio actualizado correctamente",
          type: "success",
        });
      } else {
        await addServicio(payload);
        setUiAlert({
          msg: "Servicio registrado correctamente",
          type: "success",
        });
      }

      await recargarServicios();
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err?.message || "Error inesperado", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const servicio = servicios.find((s) => s.id === id);
    if (servicio) {
      const subServiciosUI: SubServicioUI[] =
        servicio.subServicios.length > 0
          ? servicio.subServicios.map((ss) => ({
              numero: ss.numero,
              fecha: ss.fecha,
              tipoServicio: servicio.tipoServicio,
              verracoId: ss.verracoId,
              inseminador: ss.inseminador,
            }))
          : [
              {
                numero: 1,
                fecha: servicio.fecha,
                tipoServicio: servicio.tipoServicio,
                verracoId: servicio.verracoId,
                inseminador: "",
              },
            ];

      setForm({
        ...servicio,
        subServiciosUI,
      });
      setEditId(id);
      setShowDialog(true);
      setSugerenciasMadres([]);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteServicio(id);
      await recargarServicios();
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

  return (
    <Card sx={{ mb: 3, maxWidth: 1050, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Servicios/Inseminaciones de Gestación
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
            Registrar Servicio
          </Button>

          <TextField
            select
            label="Orden"
            size="small"
            SelectProps={{ native: true }}
            value={orderDirection}
            onChange={(e) =>
              setOrderDirection(e.target.value as "asc" | "desc")
            }
            sx={{ ml: 2, minWidth: 200 }}
          >
            <option value="desc">Más nuevos primero</option>
            <option value="asc">Más antiguos primero</option>
          </TextField>
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
                <th>ID Madre</th>
                <th>Tipo Servicio</th>
                <th>ID Verraco</th>
                <th>Inseminador</th>
                <th>Servicios</th>
                <th>Resultado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => {
                const primerInseminador =
                  s.subServicios[0]?.inseminador || "";
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.fecha}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.identificacionMadre}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.tipoServicio}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.verracoId}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {primerInseminador}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {getEstadoServicios(s)}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.resultado}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>
                      {s.observaciones}
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
                        onClick={() => handleEditar(s.id)}
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
                        onClick={() => handleEliminar(s.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {servicios.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: 12,
                      fontSize: 14,
                      color: "#666",
                    }}
                  >
                    No hay servicios registrados.
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
            {editId !== null ? "Editar Servicio" : "Registrar Servicio"}
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
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={(e) => handleChangeMain("fecha", e.target.value)}
              />
              <Box sx={{ position: "relative", minWidth: 220 }}>
                <TextField
                  label="ID Madre"
                  value={form.identificacionMadre}
                  onChange={(e) => handleChangeIdentificacion(e.target.value)}
                  fullWidth
                />
                {Boolean(sugerenciasMadres.length) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      border: "1px solid #ddd",
                      zIndex: 10,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {sugerenciasMadres.map((m) => (
                      <Box
                        key={m.id}
                        sx={{
                          px: 1,
                          py: 0.5,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                        onClick={() => handleSelectMadre(m)}
                      >
                        {m.identificacion} — {m.raza} — {m.estado}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <TextField
                label="Tipo Servicio"
                select
                SelectProps={{ native: true }}
                value={form.tipoServicio}
                onChange={(e) =>
                  handleChangeMain(
                    "tipoServicio",
                    e.target.value as ServicioGestacion["tipoServicio"]
                  )
                }
              >
                {tipoServicioOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
              <TextField
                label="ID Verraco"
                value={form.verracoId}
                onChange={(e) => handleChangeMain("verracoId", e.target.value)}
              />
              <TextField
                label="Resultado"
                select
                SelectProps={{ native: true }}
                value={form.resultado}
                onChange={(e) =>
                  handleChangeMain(
                    "resultado",
                    e.target.value as ResultadoServicio
                  )
                }
              >
                {resultadoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography variant="subtitle1">
                Servicios en este celo
              </Typography>
              {form.subServiciosUI.map((ss, index) => (
                <Box
                  key={ss.numero}
                  sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
                >
                  <TextField
                    label={`Servicio #${ss.numero} - Fecha`}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={ss.fecha}
                    onChange={(e) =>
                      handleChangeSubUI(index, "fecha", e.target.value)
                    }
                  />
                  <TextField
                    label="Tipo Servicio"
                    select
                    SelectProps={{ native: true }}
                    value={ss.tipoServicio}
                    onChange={(e) =>
                      handleChangeSubUI(
                        index,
                        "tipoServicio",
                        e.target.value as ServicioGestacion["tipoServicio"]
                      )
                    }
                  >
                    {tipoServicioOptions.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    label="ID Verraco"
                    value={ss.verracoId}
                    onChange={(e) =>
                      handleChangeSubUI(index, "verracoId", e.target.value)
                    }
                  />
                  <TextField
                    label="Inseminador"
                    value={ss.inseminador}
                    onChange={(e) =>
                      handleChangeSubUI(index, "inseminador", e.target.value)
                    }
                  />
                  {form.subServiciosUI.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => handleRemoveSubServicioUI(index)}
                      sx={{
                        alignSelf: "center",
                        minWidth: 90,
                      }}
                    >
                      Quitar
                    </Button>
                  )}
                </Box>
              ))}
              {form.subServiciosUI.length < 3 && (
                <Box>
                  <Button variant="outlined" onClick={handleAddSubServicioUI}>
                    + Añadir servicio
                  </Button>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                p: 2,
              }}
            >
              <TextField
                label="Observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  handleChangeMain("observaciones", e.target.value)
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
