// src/pages/Sitio3/Sitio3.tsx
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

// IMPORTS submódulos Sitio 3
import Sitio3Ingreso from "./Ingreso";
import Sitio3Corrales from "./Corrales";
import Sitio3Nutricion from "./Nutricion";
import Sitio3SaludBienestar from "./SaludBienestar";
import Sitio3Crecimiento from "./Crecimiento";
import Sitio3Mortalidad from "./Mortalidad";
import Sitio3Comercializacion from "./Comercializacion";
import Sitio3KPIs from "./KPIs";
import Sitio3Reporte from "./Reporte"; // <-- nombre igual al archivo

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
  { text: "Reportes", icon: <BarChartIcon />, path: "/reportes" }, // <-- ruta correcta
  { text: "Económico", icon: <MonetizationOnIcon />, path: "/economico" },
];

const subModulos = [
  "Ingreso a Engorde",
  "Manejo de Corrales",
  "Nutrición y Alimentación",
  "Salud y Bienestar",
  "Seguimiento de Crecimiento",
  "Mortalidad y Descartes",
  "Salida y Comercialización",
  "KPIs",
  "Reportes",
];

export default function Sitio3() {
  const [activeTab, setActiveTab] = useState(0);
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

      <Box sx={{ flexGrow: 1 }}>
        <Navbar
          isAuthenticated={true}
          onLogout={() => {
            localStorage.clear();
            navigate("/login");
          }}
        />

        <Box sx={{ pt: 10 }}>
          {/* CINTILLO SITIO 3 IGUAL A GRANJA / SITIO 2 */}
          <Box
            sx={{
              background: "#fff",
              pt: 3,
              pb: 0,
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
              <Typography variant="h5" sx={{ fontWeight: 700, pb: 2 }}>
                Sitio 3 – Engorde avanzado y gestión fina
              </Typography>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 40,
                  "& .MuiTab-root": {
                    fontSize: 13,
                    minHeight: 30,
                    textTransform: "none",
                  },
                  mb: 0,
                }}
              >
                {subModulos.map((s, idx) => (
                  <Tab key={s} label={s} value={idx} />
                ))}
              </Tabs>
            </Box>
          </Box>

          {/* CONTENIDO CENTRADO MISMO ANCHO */}
          <Box
            sx={{
              background: "#f9fbfc",
              py: 4,
              display: "flex",
              justifyContent: "center",
              minHeight: "75vh",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: CONTENT_MAX_WIDTH,
                px: 2,
              }}
            >
              {activeTab === 0 && <Sitio3Ingreso />}
              {activeTab === 1 && <Sitio3Corrales />}
              {activeTab === 2 && <Sitio3Nutricion />}
              {activeTab === 3 && <Sitio3SaludBienestar />}
              {activeTab === 4 && <Sitio3Crecimiento />}
              {activeTab === 5 && <Sitio3Mortalidad />}
              {activeTab === 6 && <Sitio3Comercializacion />}
              {activeTab === 7 && <Sitio3KPIs />}
              {activeTab === 8 && <Sitio3Reporte />} {/* <-- nombre correcto */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
