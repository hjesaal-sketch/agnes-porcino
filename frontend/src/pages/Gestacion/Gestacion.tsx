// src/pages/Gestacion/Gestacion.tsx
import React, { useState } from "react";
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
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BabyIcon from "@mui/icons-material/BabyChangingStation";
import AgriculturalIcon from "@mui/icons-material/Agriculture";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScienceIcon from "@mui/icons-material/Science";
import RoomIcon from "@mui/icons-material/Room";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

// Submódulos de gestación (páginas internas)
import RegistroMadres from "./RegistroMadres";
import Servicios from "./Servicios";
import IndiceGrasaDorsal from "./IndiceGrasaDorsal";
import PartosProgramados from "./PartosProgramados";
import Historial from "./Historial";
import Alertas from "./Alertas";
import KPIs from "./KPIs";
import Reportes from "./Reportes";

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
  "Registro de Madres",
  "Servicios",
  "I. G. Dorsal",
  "Partos Programados",
  "Historial de Gestación",
  "Alertas",
  "KPIs Productivos",
  "Reportes",
];

export default function Gestacion() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "#f7f7f7",
      }}
    >
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
      <Box sx={{ flexGrow: 1, maxWidth: `calc(100% - ${SIDEBAR_WIDTH}px)` }}>
        <Navbar
          isAuthenticated={true}
          onLogout={() => {
            localStorage.clear();
            navigate("/login");
          }}
        />
        <Box sx={{ pt: 10 }}>
          <Box
            sx={{
              background: "#fff",
              pt: 3,
              pb: 0,
              px: 4,
              maxWidth: CONTENEDOR_MAX_WIDTH,
              margin: "0 auto",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, pb: 2 }}>
              Gestación Porcina - Módulo de Gestión Integral
            </Typography>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: 40,
                "& .MuiTab-root": { fontSize: 13, minHeight: 30 },
                mb: 0,
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              {subModulos.map((s, idx) => (
                <Tab key={s} label={s} value={idx} />
              ))}
            </Tabs>
          </Box>
          <Box
            sx={{
              px: 4,
              py: 4,
              background: "#f9fbfc",
              minHeight: "75vh",
              maxWidth: CONTENEDOR_MAX_WIDTH,
              margin: "0 auto",
            }}
          >
            {activeTab === 0 && <RegistroMadres />}
            {activeTab === 1 && <Servicios />}
            {activeTab === 2 && <IndiceGrasaDorsal />}
            {activeTab === 3 && <PartosProgramados />}
            {activeTab === 4 && <Historial />}
            {activeTab === 5 && <Alertas />}
            {activeTab === 6 && <KPIs />}
            {activeTab === 7 && <Reportes />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
