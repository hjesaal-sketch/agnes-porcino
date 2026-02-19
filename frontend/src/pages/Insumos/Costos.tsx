// src/pages/Insumos/Costos.tsx
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
  getCostos,
  addCosto,
  updateCosto,
  deleteCosto,
  CostoInsumo,
  NuevoCostoInsumo,
} from "../../services/insumos/Costos";

const categoriaOptions = [
  "Medicamento/Vacuna",
  "Alimento",
  "Equipo/Herramienta",
  "Limpieza",
  "Suministro General",
] as const;

const emptyForm: NuevoCostoInsumo = {
  fecha: "",
  modulo: "",
  categoria: "Medicamento/Vacuna",
  insumo: "",
  lote: "",
  cantidad: 0,
  unidad: "unidad",
  costoUnitario: 0,
  costoTotal: 0,
  proveedor: "",
  descripcion: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function InsumosCostos() {
  const [costos, setCostos] = useState<CostoInsumo[]>([]);
  const [form, setForm] = useState<NuevoCostoInsumo>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      const data = await getCostos();
      setCostos(data);
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.categoria || !form.insumo) {
        setUiAlert({
          msg: "Completa fecha, categoría e insumo",
          type: "error",
        });
        return;
      }
      if (editId !== null) {
        await updateCosto(editId, form);
        setUiAlert({
          msg: "Costo actualizado correctamente",
          type: "success",
        });
      } else {
        await addCosto(form);
        setUiAlert({
          msg: "Costo agregado correctamente",
          type: "success",
        });
      }
      const data = await getCostos();
      setCostos(data);
      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (err: any) {
      setUiAlert({ msg: err.message || "Error", type: "error" });
    }
  };

  const handleEditar = (id: number) => {
    const costo = costos.find((c) => c.id === id);
    if (costo) {
      const {
        id: _id,
        presupuesto: _p,
        real: _r,
        variacion: _v,
        ...rest
      } = costo;
      setForm({
        fecha: rest.fecha,
        modulo: rest.modulo,
        categoria: rest.categoria,
        insumo: rest.insumo,
        lote: rest.lote ?? "",
        cantidad: rest.cantidad,
        unidad: rest.unidad,
        costoUnitario: rest.costoUnitario,
        costoTotal: rest.costoTotal,
        proveedor: rest.proveedor ?? "",
        descripcion: rest.descripcion,
      });
      setEditId(id);
      setShowDialog(true);
    }
  };

  const handleEliminar = async (id: number) => {
    await deleteCosto(id);
    const data = await getCostos();
    setCostos(data);
    setUiAlert({ msg: "Registro eliminado", type: "success" });
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, maxWidth: 980, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Control de Costos de Insumos
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
          Registrar Costo
        </Button>

        {/* Contenedor con scroll horizontal y tabla ensanchada */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              minWidth: 1150,
              borderCollapse: "collapse",
              background: "#fff",
              marginBottom: 24,
              boxShadow: "0 1px 8px #0001",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 33 }}>
                <th>Fecha</th>
                <th>Módulo</th>
                <th>Categoría</th>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Costo unitario</th>
                <th>Costo total</th>
                <th>Variación</th>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {costos.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.modulo}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.categoria}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.insumo}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.cantidad}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>{c.unidad}</td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.costoUnitario.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.costoTotal.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.variacion !== undefined
                      ? `${c.variacion >= 0 ? "+" : ""}${c.variacion.toFixed(2)}`
                      : "—"}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.proveedor || "—"}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 13 }}>
                    {c.descripcion}
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
                      onClick={() => handleEditar(c.id)}
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
                      onClick={() => handleEliminar(c.id)}
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
            {editId ? "Editar Costo" : "Registrar Costo"}
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
              />
              <TextField
                label="Módulo"
                value={form.modulo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modulo: e.target.value }))
                }
              />
              <TextField
                label="Categoría"
                select
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoria: e.target.value as CostoInsumo["categoria"],
                  }))
                }
                sx={{ minWidth: 160 }}
              >
                {categoriaOptions.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Insumo"
                value={form.insumo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, insumo: e.target.value }))
                }
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Cantidad"
                type="number"
                value={form.cantidad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cantidad: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Unidad"
                value={form.unidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unidad: e.target.value }))
                }
              />
              <TextField
                label="Costo unitario"
                type="number"
                value={form.costoUnitario}
                onChange={(e) => {
                  const valor = Number(e.target.value) || 0;
                  setForm((f) => ({
                    ...f,
                    costoUnitario: valor,
                    costoTotal: valor * (f.cantidad || 0),
                  }));
                }}
              />
              <TextField
                label="Costo total"
                type="number"
                value={form.costoTotal}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    costoTotal: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Proveedor"
                value={form.proveedor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, proveedor: e.target.value }))
                }
              />
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
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
