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
  GridLegacy as Grid,
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
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PetsIcon from "@mui/icons-material/Pets";
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
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
  { text: "Sanidad", icon: <HealthAndSafetyIcon />, path: "/sanidad" },
  { text: "Acerca de", icon: <InfoIcon />, path: "/acerca-de" },
];

type DashboardProps = {
  isAuthenticated: boolean;
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

export default function Dashboard({ isAuthenticated }: DashboardProps) {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);
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

  const indicatorStats: (
    | {
        label: string;
        value: string | number;
        icon: React.ReactElement;
        color: string;
        tooltip: string;
      }
    | null
  )[] = indicadores
    ? [
        {
          label: "Próximos partos",
          value: indicadores.proximos_partos,
          icon: <LocalHospitalIcon />,
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
          icon: <PetsIcon />,
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
          icon: <InventoryIcon />,
          color: "#e1f5fe",
          tooltip: "Inventario bajo de medicamento",
        },
        {
          label: "Celos recientes",
          value: indicadores.celos_recientes,
          icon: <BabyIcon />,
          color: "#fce4ec",
          tooltip: "Detectados en los últimos días",
        },
        {
          label: "Listos para destete",
          value: indicadores.listos_destete,
          icon: <AgriculturalIcon />,
          color: "#e8fce7",
          tooltip: "Lotes listos para destetar",
        },
      ]
    : [];

  const handleCloseSnackbar = () => setUiAlert(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    const tabRoutes = ["/dashboard", "/reportes"];
    navigate(tabRoutes[newValue]);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#0e2e1f",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 600, letterSpacing: 1 }}
          >
            AGNES
          </Typography>
        </Box>
        <List>
          {menu.map((i) => (
            <ListItemButton
              key={i.text}
              onClick={() => navigate(i.path)}
              sx={{
                color:
                  window.location.pathname === i.path
                    ? "#169b62"
                    : "#fff",
                background:
                  window.location.pathname === i.path
                    ? "rgba(22, 155, 98, 0.09)"
                    : "none",
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{i.icon}</ListItemIcon>
              <ListItemText primary={i.text} sx={{ color: "inherit" }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10,
          minHeight: "100vh",
          backgroundColor: "#f5f7f9",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0e2e1f" }}>
            Dashboard sanitario-zoosanitario
          </Typography>
        </Box>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Visión general" />
          <Tab label="Análisis" />
        </Tabs>
        
        {tab === 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {indicatorStats.map((stat, idx) =>
                stat ? (
                  <Grid item xs={6} sm={4} md={3} key={idx}>
                    <Card sx={{ backgroundColor: stat.color, boxShadow: 1 }}>
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Tooltip title={stat.tooltip}>
                          <Box sx={{ color: "#169b62", mb: 0.5 }}>
                            {stat.icon}
                          </Box>
                        </Tooltip>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, color: "#169b62" }}
                        >
                          {stat.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null
              )}
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Card sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Resumen reproductivo
                    </Typography>
                    {resumenReproductivo.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={resumenReproductivo}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fecha" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="partos"
                            stroke="#169b62"
                            name="Partos"
                          />
                          <Line
                            type="monotone"
                            dataKey="nacidos"
                            stroke="#2196f3"
                            name="Nacidos"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                        <ErrorIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography>
                          Sin datos de resumen reproductivo
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Próximos eventos y tareas
                    </Typography>
                    {eventos.length > 0 ? (
                      <Stack spacing={1.5}>
                        {eventos.slice(0, 5).map((evento, i) => (
                          <Box
                            key={i}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: "#f5f7f9",
                            }}
                          >
                            <Typography variant="body2">
                              <strong>{evento.tipo}:</strong> {evento.descripcion}
                              {" "}
                              ({evento.cantidad}) -{" "}
                              {new Date(evento.fecha_evento).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                        <Typography>Sin eventos próximos</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {tab === 1 && (
          <Card sx={{ boxShadow: 1, p: 3, textAlign: "center" }}>
            <Box sx={{ color: "#999", mb: 1 }}>
              <ErrorIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h6">
              ANÁLISIS DETALLADO
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Indicadores, Historial y Reportes disponibles en la sección de
              Análisis...
            </Typography>
          </Card>
        )}

        <Snackbar
          open={!!uiAlert}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={uiAlert?.type}
            sx={{ width: "100%" }}
          >
            {uiAlert?.msg}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
}
