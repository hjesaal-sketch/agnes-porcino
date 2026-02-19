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
  Card,
  CardContent,
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

import Ingresos from "./Ingresos";
import Egresos from "./Egresos";
import Costos from "./Costos";
import Impuestos from "./Impuestos";
import KPIs from "./KPIs";
import Reportes from "./Reportes";

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
];

const menuEconomico = [
  "Ingresos",
  "Egresos",
  "Costos",
  "Impuestos",
  "KPIs",
  "Reportes",
];

export default function Economico() {
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

        <Box sx={{ pt: 10, display: "flex", justifyContent: "center", pb: 4 }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: CONTENT_MAX_WIDTH,
              px: 2,
            }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Panel Económico Integral
                </Typography>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  textColor="primary"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 38,
                    "& .MuiTab-root": { fontSize: 13, minHeight: 28 },
                    mb: 3,
                  }}
                >
                  {menuEconomico.map((s, idx) => (
                    <Tab key={s} label={s} value={idx} />
                  ))}
                </Tabs>
                <Box
                  sx={{
                    minHeight: "65vh",
                    background: "#f9fbfc",
                    borderRadius: 3,
                    p: 3,
                    mt: 1,
                  }}
                >
                  {activeTab === 0 && <Ingresos />}
                  {activeTab === 1 && <Egresos />}
                  {activeTab === 2 && <Costos />}
                  {activeTab === 3 && <Impuestos />}
                  {activeTab === 4 && <KPIs />}
                  {activeTab === 5 && <Reportes />}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
