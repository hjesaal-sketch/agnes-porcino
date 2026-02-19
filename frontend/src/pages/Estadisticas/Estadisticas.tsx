// src/pages/Estadisticas/Estadisticas.tsx
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
  Divider,
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
import Navbar from "../../components/Navbar/Navbar";
import {
  getIndicadores,
  getResumenMensual,
  getResumenGlobal,
  transformToChartData,
  IndicadorEstadistica,
  ResumenMensual,
  ResumenGlobal,
  ChartDataMensual,
} from "../../services/Estadisticas";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
];

type UiAlertState = { msg: string; type: "success" | "error" } | null;

function colorEstado(estado: string) {
  if (estado === "Bueno") return "success";
  if (estado === "Atención") return "warning";
  return "error";
}

export default function Estadisticas() {
  const navigate = useNavigate();
  const [indicadoresRepro, setIndicadoresRepro] = useState<IndicadorEstadistica[]>([]);
  const [indicadoresProd, setIndicadoresProd] = useState<IndicadorEstadistica[]>([]);
  const [resumenMensual, setResumenMensual] = useState<ResumenMensual[]>([]);
  const [resumenGlobal, setResumenGlobal] = useState<ResumenGlobal | null>(null);
  const [chartData, setChartData] = useState<ChartDataMensual[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [indRepro, indProd, resumen, global] = await Promise.all([
        getIndicadores("Reproductivo"),
        getIndicadores("Productivo"),
        getResumenMensual(),
        getResumenGlobal(),
      ]);
      setIndicadoresRepro(indRepro);
      setIndicadoresProd(indProd);
      setResumenMensual(resumen);
      setResumenGlobal(global);
      setChartData(transformToChartData(resumen));
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando datos de estadísticas",
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
            {/* Resumen global */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Estadísticas Globales de Producción
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <Chip
                    label={`Partos últimos ${resumenGlobal?.periodo_meses || 12} meses: ${
                      resumenGlobal?.total_partos || 0
                    }`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Lechones destetados últimos ${resumenGlobal?.periodo_meses || 12} meses: ${
                      resumenGlobal?.total_destetados || 0
                    }`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Mortalidad total últimos ${resumenGlobal?.periodo_meses || 12} meses: ${
                      resumenGlobal?.mortalidad_promedio || "0 %"
                    }`}
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Indicadores clave */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Indicadores Reproductivos
                </Typography>

                <Box sx={{ width: "100%", overflowX: "auto", mb: 2 }}>
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
                      {indicadoresRepro.map((ind) => (
                        <tr
                          key={ind.id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ fontSize: 14, padding: "6px 8px" }}>
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
                      {!indicadoresRepro.length && !loading && (
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

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Indicadores Productivos (Engorde)
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
                      {indicadoresProd.map((ind) => (
                        <tr
                          key={ind.id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ fontSize: 14, padding: "6px 8px" }}>
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
                      {!indicadoresProd.length && !loading && (
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

            {/* Resumen mensual con gráfico */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Tendencia mensual de partos y destetes
                </Typography>

                <Box sx={{ width: "100%", height: 260, mb: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 25, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="partos"
                        name="Partos"
                        stroke="#169b62"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lechonesDestetados"
                        name="Lechones destetados"
                        stroke="#ff9800"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

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
                        <th>Mes</th>
                        <th>Partos</th>
                        <th>Lechones destetados</th>
                        <th>Mortalidad total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenMensual.map((r) => (
                        <tr
                          key={r.id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.mes}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.partos}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.lechones_destetados}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.mortalidad_total}
                          </td>
                        </tr>
                      ))}
                      {!resumenMensual.length && !loading && (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              textAlign: "center",
                              padding: 12,
                              fontSize: 14,
                            }}
                          >
                            Sin datos
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
