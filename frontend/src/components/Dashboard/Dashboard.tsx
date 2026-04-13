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
  Grid2 as Grid,
  Paper,
  CircularProgress,
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

type DashboardProps = { isAuthenticated: boolean };
type UiAlertState = { msg: string; type: "success" | "error" } | null;

const iconMap: Record<string, React.ReactElement> = {
  partos: <LocalHospitalIcon />,
  fallos: <ErrorIcon />,
  mortalidad: <PetsIcon />,
  alimento: <RestaurantIcon />,
  medicamento: <InventoryIcon />,
  celos: <LocalHospitalIcon />,
  destete: <BabyIcon />,
};

const getStatIcon = (label: string) => {
  const key = label.toLowerCase().split(" ")[0];
  if (key.includes("parto")) return iconMap.partos;
  if (key.includes("fallo")) return iconMap.fallos;
  if (key.includes("mortalidad")) return iconMap.mortalidad;
  if (key.includes("alimento")) return iconMap.alimento;
  if (key.includes("medicamento")) return iconMap.medicamento;
  if (key.includes("celo")) return iconMap.celos;
  if (key.includes("destete")) return iconMap.destete;
  return <DashboardIcon />;
};

export default function Dashboard({ isAuthenticated }: DashboardProps) {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);
  const [indicadores, setIndicadores] = useState<IndicadorStats | null>(null);
  const [eventos, setEventos] = useState<EventoTarea[]>([]);
  const [resumenReproductivo, setResumenReproductivo] = useState<ResumenReproductivo[]>([]);

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
      setUiAlert({ msg: e?.message || "Error cargando datos del dashboard", type: "error" });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const indicatorStats = indicadores
    ? [
        { label: "Próximos partos", value: indicadores.proximos_partos },
        { label: "Fallos reproductivos", value: indicadores.fallos_reproductivos },
        { label: "Mortalidad", value: indicadores.mortalidad },
        { label: "Alimento bajo", value: indicadores.alimento_bajo },
        { label: "Medicamento bajo", value: indicadores.medicamento_bajo },
        { label: "Celos recientes", value: indicadores.celos_recientes },
        { label: "Listos para destete", value: indicadores.listos_destete },
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
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#0f172a",
            color: "#fff",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "#169b62", fontWeight: "bold" }}>
            AGNES
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Sistema Granja Porcina
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {menu.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                color: window.location.pathname === item.path ? "#169b62" : "#fff",
                background:
                  window.location.pathname === item.path ? "rgba(22, 155, 98, 0.09)" : "none",
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0f172a" }}>
            Dashboard sanitario-zoosanitario
          </Typography>
          <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2 }}>
            <Tab label="Visión General" />
            <Tab label="Análisis" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <>
            {/* Cards de indicadores */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {indicatorStats.map((stat, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                  <Card sx={{ bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: "#169b62" }}>{getStatIcon(stat.label)}</Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0f172a" }}>
                            {stat.value ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Resumen reproductivo */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                      Resumen reproductivo
                    </Typography>
                    {resumenReproductivo.length > 0 ? (
                      resumenReproductivo.map((r, i) => (
                        <Box key={i} sx={{ py: 1, borderBottom: i < resumenReproductivo.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                          <Typography variant="body1">{r.lote || "Sin lote"}</Typography>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                            {r.evento} - {r.fecha}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ color: "#94a3b8" }}>Sin datos de resumen reproductivo</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Eventos próximos */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                      Próximos eventos y tareas
                    </Typography>
                    {eventos.length > 0 ? (
                      eventos.slice(0, 5).map((evento, i) => (
                        <Box key={i} sx={{ py: 1, borderBottom: i < eventos.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                          <Typography variant="body1">
                            <strong>{evento.tipo}:</strong> {evento.descripcion} ({evento.cantidad})
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                            {new Date(evento.fecha_evento).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ color: "#94a3b8" }}>Sin eventos próximos</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {tab === 1 && (
          <Card sx={{ bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                ANÁLISIS DETALLADO
              </Typography>
              <Typography sx={{ color: "#64748b" }}>
                Indicadores, Historial y Reportes disponibles en la sección de Análisis...
              </Typography>
            </CardContent>
          </Card>
        )}

        {uiAlert && (
          <Snackbar open autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            <MuiAlert severity={uiAlert.type} onClose={handleCloseSnackbar}>
              {uiAlert.msg}
            </MuiAlert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
}
