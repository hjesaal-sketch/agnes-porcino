//src/components/Dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  Stack,
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
import EventIcon from "@mui/icons-material/Event";
import ErrorIcon from "@mui/icons-material/Error";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PetsIcon from "@mui/icons-material/Pets";
import { useNavigate } from "react-router-dom";
import {
  getIndicadores,
  getEventosTareas,
  getResumenReproductivo,
  IndicadorStats,
  EventoTarea,
  ResumenReproductivo,
} from "../../services/Dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const SIDEBAR_WIDTH = 220;

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
];

type DashboardProps = {
  isAuthenticated: boolean;
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Dashboard({ isAuthenticated }: DashboardProps) {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  // Datos del dashboard
  const [indicadores, setIndicadores] = useState<IndicadorStats | null>(null);
  const [eventos, setEventos] = useState<EventoTarea[]>([]);
  const [resumenReproductivo, setResumenReproductivo] = useState<
    ResumenReproductivo[]
  >([]);

  const cargarDatos = async () => {
    try {
      const [ind, evt, res] = await Promise.all([
        getIndicadores(),
        getEventosTareas(false),
        getResumenReproductivo(),
      ]);
      setIndicadores(ind);
      setEventos(evt);
      setResumenReproductivo(res);
    } catch (e: any) {
      setUiAlert({
        msg: e?.message || "Error cargando datos del dashboard",
        type: "error",
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Mapear indicadores a cards dinámicas
  const indicatorStats = indicadores
    ? [
        {
          label: "Próximos partos",
          value: indicadores.proximos_partos,
          icon: <AgriculturalIcon />,
          color: "#f8fafc",
          tooltip: "Hembras próximas a parto",
        },
        {
          label: "Fallos reproductivos",
          value: indicadores.fallos_reproductivos,
          icon: <ErrorIcon />,
          color: "#fff0f1",
          tooltip: "Inseminaciones no exitosas",
        },
        {
          label: "Mortalidad",
          value: indicadores.mortalidad,
          icon: <LocalHospitalIcon />,
          color: "#f3e8ff",
          tooltip: "Mortalidad reciente",
        },
        {
          label: "Alimento bajo",
          value: indicadores.alimento_bajo,
          icon: <RestaurantIcon />,
          color: "#fffbe7",
          tooltip: "Inventario bajo de alimento",
        },
        {
          label: "Medicamento bajo",
          value: indicadores.medicamento_bajo,
          icon: <ScienceIcon />,
          color: "#e1f5fe",
          tooltip: "Inventario bajo de medicamento",
        },
        {
          label: "Celos recientes",
          value: indicadores.celos_recientes,
          icon: <PetsIcon />,
          color: "#fce4ec",
          tooltip: "Detectados en los últimos días",
        },
        {
          label: "Listos para destete",
          value: indicadores.listos_destete,
          icon: <BabyIcon />,
          color: "#e8fce7",
          tooltip: "Lotes listos para destetar",
        },
      ]
    : [];

  const handleCloseSnackbar = () => setUiAlert(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);

    // Mapeo de tabs a rutas
    const tabRoutes = [
      "/dashboard", // 0 - Visión General
      "/reportes", // 1 - Análisis (Indicadores + Historial + Reportes)
    ];

    navigate(tabRoutes[newValue]);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: "#1d3557",
            color: "#fff",
          },
        }}
      >
        <Box sx={{ height: 64 }} />
        <List sx={{ mt: 2 }}>
          {menu.map((i) => (
            <ListItemButton
              key={i.text}
              onClick={() => navigate(i.path)}
              sx={{
                color: window.location.pathname === i.path ? "#169b62" : "#fff",
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

      <Box sx={{ flexGrow: 1, pt: 10, pl: 0, pr: 0 }}>
        <Box sx={{ background: "#fff", pt: 3, pb: 1, px: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Dashboard sanitario-zoosanitario
          </Typography>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 48 }}
          >
            <Tab label="VISIÓN GENERAL" />
            <Tab label="ANÁLISIS" />
          </Tabs>
        </Box>

        {/* Mostrar contenido solo en la primera tab (Visión General) */}
        {tab === 0 && (
          <>
            {/* Indicadores dinámicos */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ px: 4, py: 3, flexWrap: "wrap", gap: 2 }}
            >
              {indicatorStats.map((stat) => (
                <Tooltip key={stat.label} title={stat.tooltip} arrow>
                  <Card
                    sx={{
                      background: stat.color,
                      minWidth: 180,
                      minHeight: 110,
                      mb: 2,
                      cursor: "pointer",
                      borderRadius: 3,
                      boxShadow: 1,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                        }}
                      >
                        {stat.icon}
                        <Typography
                          sx={{ fontSize: 15, fontWeight: 700 }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{ color: "#27632a", fontWeight: 700 }}
                      >
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              ))}
            </Stack>

            <Box
              sx={{
                px: 4,
                pb: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {/* Gráfica de Resumen Reproductivo */}
              <Card sx={{ flex: 2, minWidth: 300, minHeight: 300 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    <BarChartIcon color="success" sx={{ mr: 1 }} />
                    Resumen reproductivo
                  </Typography>
                  {resumenReproductivo.length > 0 ? (
                    <Box sx={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={resumenReproductivo}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e0e0"
                          />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <RechartsTooltip />
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
                            dataKey="fallos"
                            name="Fallos"
                            stroke="#ff6b6b"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mortalidad"
                            name="Mortalidad"
                            stroke="#ffa94d"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="destetes"
                            name="Destetes"
                            stroke="#4dabf7"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Sin datos de resumen reproductivo
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Próximos eventos y tareas */}
              <Card sx={{ flex: 1, minWidth: 240, minHeight: 300 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    Próximos eventos y tareas
                  </Typography>
                  {eventos.length > 0 ? (
                    <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                      {eventos.slice(0, 5).map((evento) => (
                        <Typography
                          key={evento.id}
                          variant="body2"
                          sx={{
                            mb: 1,
                            pb: 1,
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <strong>{evento.tipo}:</strong> {evento.descripcion} (
                          {evento.cantidad}) -{" "}
                          {new Date(
                            evento.fecha_evento
                          ).toLocaleDateString()}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Sin eventos próximos
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box sx={{ px: 4, py: 3 }}>
            <Typography variant="h6">ANÁLISIS DETALLADO</Typography>
            <Typography variant="body2" sx={{ color: "#666", mt: 2 }}>
              Indicadores, Historial y Reportes disponibles en la sección de
              Análisis...
            </Typography>
          </Box>
        )}
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
