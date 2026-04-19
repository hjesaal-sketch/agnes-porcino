// frontend/src/pages/Usuarios/Usuarios.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BabyIcon from "@mui/icons-material/BabyChangingStation";
import AgriculturalIcon from "@mui/icons-material/Agriculture";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScienceIcon from "@mui/icons-material/Science";
import RoomIcon from "@mui/icons-material/Room";
import BarChartIcon from "@mui/icons-material/BarChart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  Usuario,
  RolUsuario,
} from "../../services/Usuarios";

const SIDEBAR_WIDTH = 220;
const CONTENT_MAX_WIDTH = 1050;

type UiAlertState = { msg: string; type: "success" | "error" } | null;

const roles: RolUsuario[] = [
  "Dueño",
  "Gerente General",
  "Gerente de Granja",
  "Operador",
  "Administrador",
  "Consultor",
  "Veterinario",
];

const menu = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Gestación", icon: <LocalHospitalIcon />, path: "/gestacion" },
  { text: "Maternidad", icon: <BabyIcon />, path: "/maternidad" },
  { text: "Granja", icon: <AgriculturalIcon />, path: "/granja" },
  { text: "Insumos", icon: <InventoryIcon />, path: "/insumos" },
  { text: "Genética", icon: <ScienceIcon />, path: "/genetica" },
  { text: "Sitio 2", icon: <RoomIcon />, path: "/sitio2" },
  { text: "Sitio 3", icon: <RoomIcon />, path: "/sitio3" },
  { text: "Reportes", icon: <BarChartIcon />, path: "/reportes" },
  { text: "Económico", icon: <MonetizationOnIcon />, path: "/economico" },
  { text: "Usuarios", icon: <PeopleIcon />, path: "/usuarios" },
];

const emptyForm = {
  nombre: "",
  email: "",
  rol: "Operador" as RolUsuario,
  activo: true,
};

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando usuarios",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.activo).length;
  const admins = usuarios.filter((u) => u.rol === "Administrador").length;
  const operarios = usuarios.filter((u) => u.rol === "Operador").length;

  const limpiarForm = () => setForm(emptyForm);

  const handleGuardar = async () => {
    if (!form.nombre || !form.email) {
      setUiAlert({
        msg: "Completa nombre y correo electrónico",
        type: "error",
      });
      return;
    }

    try {
      if (editId) {
        const actualizado = await updateUsuario(editId, {
          nombre: form.nombre,
          rol: form.rol,
          activo: form.activo,
        });
        setUsuarios((prev) =>
          prev.map((u) => (u.id === editId ? actualizado : u))
        );
        setUiAlert({
          msg: "Usuario actualizado correctamente",
          type: "success",
        });
      } else {
        const empresaIdGuardado = localStorage.getItem("empresa_id");

        if (!empresaIdGuardado) {
          setUiAlert({
            msg: "No se encontró la empresa del usuario actual. Debes iniciar sesión nuevamente.",
            type: "error",
          });
          return;
        }

        const empresa_id = Number(empresaIdGuardado);

        if (Number.isNaN(empresa_id)) {
          setUiAlert({
            msg: "El identificador de empresa es inválido. Debes iniciar sesión nuevamente.",
            type: "error",
          });
          return;
        }

        const nuevo = await createUsuario({
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          activo: form.activo,
          empresa_id,
        });

        setUsuarios((prev) => [nuevo, ...prev]);
        setUiAlert({
          msg: "Usuario creado correctamente",
          type: "success",
        });
      }

      setShowDialog(false);
      setEditId(null);
      limpiarForm();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;

      let mensaje = "Error al guardar usuario";

      if (Array.isArray(detail)) {
        mensaje = detail
          .map((item: any) => {
            const campo = Array.isArray(item?.loc)
              ? item.loc.join(".")
              : "campo";
            const texto = item?.msg || "Error de validación";
            return `${campo}: ${texto}`;
          })
          .join(", ");
      } else if (typeof detail === "string") {
        mensaje = detail;
      } else if (e?.message) {
        mensaje = e.message;
      }

      setUiAlert({
        msg: mensaje,
        type: "error",
      });
    }
  };

  const handleEditar = (id: number) => {
    const u = usuarios.find((x) => x.id === id);
    if (!u) return;
    setForm({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
    });
    setEditId(id);
    setShowDialog(true);
  };

  const handleEliminar = async (id: number) => {
    try {
      await deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setUiAlert({
        msg: "Usuario eliminado correctamente",
        type: "success",
      });
    } catch (e: any) {
      const detail = e?.response?.data?.detail;

      let mensaje = "Error al eliminar usuario";

      if (Array.isArray(detail)) {
        mensaje = detail
          .map((item: any) => {
            const campo = Array.isArray(item?.loc)
              ? item.loc.join(".")
              : "campo";
            const texto = item?.msg || "Error de validación";
            return `${campo}: ${texto}`;
          })
          .join(", ");
      } else if (typeof detail === "string") {
        mensaje = detail;
      } else if (e?.message) {
        mensaje = e.message;
      }

      setUiAlert({
        msg: mensaje,
        type: "error",
      });
    }
  };

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            background: "#1d3557",
            color: "#fff",
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ height: 64 }} />
        <List sx={{ mt: 1 }}>
          {menu.map((i) => (
            <ListItemButton
              key={i.text}
              onClick={() => navigate(i.path)}
              sx={{
                color:
                  window.location.pathname === i.path ? "#169b62" : "#fff",
                background:
                  window.location.pathname === i.path
                    ? "rgba(22, 155, 98, 0.09)"
                    : "none",
              }}
            >
              <ListItemIcon sx={{ color: "#169b62" }}>{i.icon}</ListItemIcon>
              <ListItemText primary={i.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Box
        sx={{
          flexGrow: 1,
          pt: 16,
          pb: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: CONTENT_MAX_WIDTH,
            px: 2,
          }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Gestión de Usuarios
              </Typography>

              {/* Resumen superior */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Chip
                  label={`Total usuarios: ${total}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Activos: ${activos}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`Administradores: ${admins}`}
                  variant="outlined"
                />
                <Chip
                  label={`Operadores: ${operarios}`}
                  variant="outlined"
                />
              </Box>

              <Button
                variant="contained"
                sx={{ mb: 2, bgcolor: "#169b62" }}
                onClick={() => {
                  limpiarForm();
                  setEditId(null);
                  setShowDialog(true);
                }}
              >
                Nuevo Usuario
              </Button>

              {/* Tabla de usuarios */}
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    marginBottom: 8,
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
                        height: 36,
                      }}
                    >
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Última sesión</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ textAlign: "center", fontSize: 14 }}>
                          {u.nombre}
                        </td>
                        <td style={{ textAlign: "center", fontSize: 14 }}>
                          {u.email}
                        </td>
                        <td style={{ textAlign: "center", fontSize: 14 }}>
                          {u.rol}
                        </td>
                        <td style={{ textAlign: "center", fontSize: 14 }}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </td>
                        <td style={{ textAlign: "center", fontSize: 14 }}>
                          {u.ultima_sesion
                            ? new Date(u.ultima_sesion).toLocaleString("es-CO")
                            : "-"}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: 14,
                            whiteSpace: "nowrap",
                          }}
                        >
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
                            onClick={() => handleEditar(u.id)}
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
                            onClick={() => handleEliminar(u.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!usuarios.length && !loading && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: "center",
                            padding: 12,
                            fontSize: 14,
                          }}
                        >
                          Sin usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Diálogo crear/editar */}
      <Dialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditId(null);
          limpiarForm();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            pt: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          {editId ? "Editar Usuario" : "Nuevo Usuario"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 3,
          }}
        >
          <Box sx={{ mt: 0.5 }}>
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              fullWidth
              variant="outlined"
              size="medium"
            />
          </Box>
          <TextField
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            disabled={!!editId}
            fullWidth
          />
          <TextField
            label="Rol"
            select
            value={form.rol}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                rol: e.target.value as RolUsuario,
              }))
            }
            fullWidth
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Estado"
            select
            value={form.activo ? "activo" : "inactivo"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                activo: e.target.value === "activo",
              }))
            }
            fullWidth
          >
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
          </TextField>
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
    </Box>
  );
}
