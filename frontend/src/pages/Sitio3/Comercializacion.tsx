// src/pages/Sitio3/Comercializacion.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import {
  getVentasSitio3,
  addVentaSitio3,
  updateVentaSitio3,
  RegistroVenta3,
  NuevaVenta3,
} from "../../services/sitio3/Comercializacion";

const emptyForm: NuevaVenta3 = {
  fecha: "",
  lote: "",
  corral: "",
  cantidad_vendida: 0,
  peso_promedio_venta: 0,
  destino: "",
  precio_unitario: 0,
  responsable: "",
  observaciones: "",
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Sitio3Comercializacion() {
  const [ventas, setVentas] = useState<RegistroVenta3[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NuevaVenta3>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getVentasSitio3();
        setVentas(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando ventas/salidas Sitio 3",
          type: "error",
        });
      }
    })();
  }, []);

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    try {
      if (!form.fecha || !form.lote || !form.destino || form.cantidad_vendida <= 0) {
        setUiAlert({
          msg: "Completa fecha, lote, destino y cantidad (>0)",
          type: "error",
        });
        return;
      }
      if (form.precio_unitario < 0 || form.peso_promedio_venta < 0) {
        setUiAlert({
          msg: "Precio y peso promedio no pueden ser negativos",
          type: "error",
        });
        return;
      }

      if (editId === null) {
        await addVentaSitio3(form);
        setUiAlert({
          msg: "Venta/Salida registrada correctamente",
          type: "success",
        });
      } else {
        await updateVentaSitio3(editId, form);
        setUiAlert({
          msg: "Venta/Salida actualizada correctamente",
          type: "success",
        });
      }

      const data = await getVentasSitio3();
      setVentas(data);
      setShowAdd(false);
      setEditId(null);
      limpiarForm();
    } catch (e: any) {
      setUiAlert({ msg: e.message || "Error", type: "error" });
    }
  };

  const handleEdit = (id: number) => {
    const venta = ventas.find((v) => v.id === id);
    if (!venta) return;
    const { id: _id, ...rest } = venta;
    setForm(rest);
    setEditId(id);
    setShowAdd(true);
  };

  const handleCloseDialog = () => {
    setShowAdd(false);
    setEditId(null);
    limpiarForm();
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Comercialización y Salidas – Sitio 3
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: "#169b62", mb: 2 }}
          onClick={() => {
            limpiarForm();
            setEditId(null);
            setShowAdd(true);
          }}
        >
          Registrar Venta o Salida
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
                <th>Lote</th>
                <th>Corral</th>
                <th>Cant. Vendida</th>
                <th>Peso Prom. Venta (kg)</th>
                <th>Destino</th>
                <th>Precio Unit. ($)</th>
                <th>Responsable</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{v.fecha}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{v.lote}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{v.corral}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {v.cantidad_vendida}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {v.peso_promedio_venta}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{v.destino}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {v.precio_unitario}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {v.responsable}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
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
                      }}
                      onClick={() => handleEdit(v.id)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Dialog
          open={showAdd}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editId === null ? "Registrar Venta/Salida" : "Editar Registro"}
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
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Lote"
                value={form.lote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lote: e.target.value }))
                }
              />
              <TextField
                label="Corral"
                value={form.corral}
                onChange={(e) =>
                  setForm((f) => ({ ...f, corral: e.target.value }))
                }
              />
              <TextField
                label="Cantidad Vendida"
                type="number"
                value={form.cantidad_vendida}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cantidad_vendida: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Peso Prom. Venta (kg)"
                type="number"
                value={form.peso_promedio_venta}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    peso_promedio_venta: Number(e.target.value) || 0,
                  }))
                }
              />
              <TextField
                label="Destino"
                value={form.destino}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destino: e.target.value }))
                }
              />
              <TextField
                label="Precio Unitario"
                type="number"
                value={form.precio_unitario}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    precio_unitario: Number(e.target.value) || 0,
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
            <Button onClick={handleCloseDialog} variant="outlined">
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
