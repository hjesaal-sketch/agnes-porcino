// src/pages/Productividad/Productividad.tsx
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
  Tabs,
  Tab,
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
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  getIndicadores,
  getHistorial,
  IndicadorProd,
  HistRow,
} from "../../services/Productividad";

const SIDEBAR_WIDTH = 220;
const CONTENT_MAX_WIDTH = 1050;

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
  { text: "Productividad", icon: <ShowChartIcon />, path: "/productividad" },
];

type UiAlertState = { msg: string; type: "success" | "error" } | null;

function colorEstado(estado: string) {
  if (estado === "Bueno") return "success";
  if (estado === "Atención") return "warning";
  return "error";
}

export default function Productividad() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<0 | 1>(0);
  const [indicadores, setIndicadores] = useState<IndicadorProd[]>([]);
  const [historial, setHistorial] = useState<HistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [indData, histData] = await Promise.all([
        getIndicadores(),
        getHistorial(),
      ]);
      setIndicadores(indData);
      setHistorial(histData);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando datos de productividad",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCloseSnackbar = () => setUiAlert(null);

  const totalKg = historial.reduce((acc, r) => acc + r.kilos_vendidos, 0);
  const promFcr =
    historial.filter((r) => r.kilos_vendidos > 0).reduce((a, r) => a + r.fcr, 0) /
    Math.max(1, historial.filter((r) => r.kilos_vendidos > 0).length);

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
      <Box sx={{ flexGrow: 1 }}>
        <Navbar
          isAuthenticated={true}
          onLogout={() => {
            localStorage.clear();
            navigate("/login");
          }}
        />

        <Box
          sx={{
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
                  Productividad
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Chip
                    label={`Kg vendidos (período listado): ${totalKg.toLocaleString(
                      "es-CO"
                    )} kg`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`FCR promedio engorde: ${promFcr.toFixed(2)}`}
                    color="success"
                    variant="outlined"
                  />
                </Box>

                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="Indicadores" />
                  <Tab label="Historial productivo" />
                </Tabs>
              </CardContent>
            </Card>

            {tab === 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Indicadores clave de productividad
                  </Typography>

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
                            height: 32,
                          }}
                        >
                          <th>Indicador</th>
                          <th>Valor actual</th>
                          <th>Objetivo</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicadores.map((ind) => (
                          <tr
                            key={ind.id}
                            style={{ borderBottom: "1px solid #eee" }}
                          >
                            <td
                              style={{
                                fontSize: 14,
                                padding: "6px 8px",
                              }}
                            >
                              {ind.nombre}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {ind.valor} {ind.unidad}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {ind.objetivo}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              <Chip
                                size="small"
                                label={ind.estado}
                                color={colorEstado(ind.estado)}
                              />
                            </td>
                          </tr>
                        ))}
                        {!indicadores.length && !loading && (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                textAlign: "center",
                                padding: 12,
                                fontSize: 14,
                              }}
                            >
                              Sin indicadores
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            )}

            {tab === 1 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Historial productivo (resumen por período y sitio)
                  </Typography>

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
                            height: 32,
                          }}
                        >
                          <th>Período</th>
                          <th>Sitio</th>
                          <th>Animales ingresados</th>
                          <th>Animales salidos</th>
                          <th>Kilos vendidos</th>
                          <th>Mortalidad</th>
                          <th>FCR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((r) => (
                          <tr
                            key={r.id}
                            style={{ borderBottom: "1px solid #eee" }}
                          >
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.periodo}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.sitio}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.animales_ingresados}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.animales_salidos}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.kilos_vendidos.toLocaleString("es-CO")}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.mortalidad}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontSize: 14,
                              }}
                            >
                              {r.fcr.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {!historial.length && !loading && (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                textAlign: "center",
                                padding: 12,
                                fontSize: 14,
                              }}
                            >
                              Sin historial
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>

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
