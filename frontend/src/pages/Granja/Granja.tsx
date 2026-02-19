// src/pages/Granja/Granja.tsx
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

// SUBMÓDULOS GRANJA
import Infraestructura from "./Infraestructura";
import Instalaciones from "./Instalaciones";
import Servicios from "./Servicios";
import Equipos from "./Equipos";
import Personal from "./Personal";
import Documentacion from "./Documentacion";
import Bioseguridad from "./Bioseguridad";
import Economico from "./Economico";
import Entorno from "./Entorno";
import Indicadores from "./Indicadores";
import Reportes from "./Reportes";

const SIDEBAR_WIDTH = 220;
const CONTENT_MAX_WIDTH = 1050; // mismo ancho que usas en Gestación / Insumos

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
  "Infraestructura y Terreno",
  "Instalaciones y Edificaciones",
  "Servicios Públicos",
  "Equipos y Maquinaria",
  "Recursos Humanos",
  "Documentación Legal y Permisos",
  "Bioseguridad y Contingencia",
  "Aspectos Económicos",
  "Entorno y Comunidad",
  "Indicadores de Gestión",
  "Reportes y Alertas",
];

export default function Granja() {
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
          {/* CINTILLO GRANJA: MISMO ANCHO Y SCROLL QUE GESTACIÓN */}
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
                Granja – Control Integral y Gestión Física
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

          {/* CONTENIDO: CENTRADO Y ALINEADO AL MISMO ANCHO */}
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
              {activeTab === 0 && <Infraestructura />}
              {activeTab === 1 && <Instalaciones />}
              {activeTab === 2 && <Servicios />}
              {activeTab === 3 && <Equipos />}
              {activeTab === 4 && <Personal />}
              {activeTab === 5 && <Documentacion />}
              {activeTab === 6 && <Bioseguridad />}
              {activeTab === 7 && <Economico />}
              {activeTab === 8 && <Entorno />}
              {activeTab === 9 && <Indicadores />}
              {activeTab === 10 && <Reportes />}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
