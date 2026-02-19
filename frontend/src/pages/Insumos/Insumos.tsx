// src/pages/Insumos/Insumos.tsx
import React, { useState, Suspense, lazy } from "react";
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
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

// Lazy load submódulos (coinciden con archivos: Alimentos.tsx, Costos.tsx,
// Equipos.tsx, Generales.tsx, Limpieza.tsx, Medicamentos.tsx, Reportes.tsx)
const Medicamentos = lazy(() => import("./Medicamentos"));
const Alimentos = lazy(() => import("./Alimentos"));
const Equipos = lazy(() => import("./Equipos"));
const Limpieza = lazy(() => import("./Limpieza"));
const Generales = lazy(() => import("./Generales"));
const Costos = lazy(() => import("./Costos"));
const Reportes = lazy(() => import("./Reportes"));

const SIDEBAR_WIDTH = 220;
const CONTENEDOR_MAX_WIDTH = 980;

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

const subModulos = [
  "Medicamentos & Vacunas",
  "Alimentos & Nutrición",
  "Equipos & Herramientas",
  "Materiales de Limpieza",
  "Suministros Generales",
  "Costos y Presupuesto",
  "Reportes y Alertas",
];

const tabProps = {
  fontSize: 12.8,
  minHeight: 19,
  px: 1,
  mx: "1px",
  minWidth: 115,
  maxWidth: 200,
};

export default function Insumos() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
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
                    ? "rgba(22,155,98,0.09)"
                    : "none",
              }}
            >
              <ListItemIcon sx={{ color: "#169b62" }}>{i.icon}</ListItemIcon>
              <ListItemText primary={i.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
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
            pt: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              background: "#fff",
              pt: 2,
              px: 2,
              pb: 0.2,
              width: "100%",
              maxWidth: CONTENEDOR_MAX_WIDTH,
              minHeight: 54,
              borderRadius: 2,
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, pb: 1 }}>
              Insumos - Gestión Integral de Inventarios
            </Typography>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 25,
                  "& .MuiTab-root": tabProps,
                  mb: 0,
                  width: "100%",
                }}
              >
                {subModulos.map((label, idx) => (
                  <Tab key={label} label={label} value={idx} />
                ))}
              </Tabs>
            </Box>
          </Box>
          <Box
            sx={{
              px: 0,
              py: 4,
              width: "100%",
              maxWidth: CONTENEDOR_MAX_WIDTH,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Suspense fallback={<div>Cargando...</div>}>
              {tab === 0 && <Medicamentos />}
              {tab === 1 && <Alimentos />}
              {tab === 2 && <Equipos />}
              {tab === 3 && <Limpieza />}
              {tab === 4 && <Generales />}
              {tab === 5 && <Costos />}
              {tab === 6 && <Reportes />}
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
