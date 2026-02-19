// src/pages/Animales/Animales.tsx
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
import {
  getResumenAnimales,
  ResumenModulo,
  ResumenAnimales,
} from "../../services/animales/Animales";

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

export default function Animales() {
  const navigate = useNavigate();

  const [resumen, setResumen] = useState<ResumenAnimales | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const EMPRESA_ID = 1;
    const GRANJA_ID = 1;

    let cancelado = false;

    const cargar = async () => {
      try {
        const data = await getResumenAnimales(EMPRESA_ID, GRANJA_ID);
        if (!cancelado) {
          setResumen(data);
        }
      } catch (e) {
        if (!cancelado) {
          console.error(e);
          setError("No se pudo cargar el resumen de animales");
          setResumen({ total: 0, modulos: [] });
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  const total = resumen?.total ?? 0;
  const modulos: ResumenModulo[] = resumen?.modulos ?? [];

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
                  Rebaño Total – Distribución por Módulo
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Chip
                    label={
                      error
                        ? "Error al cargar resumen"
                        : `Total animales: ${total}`
                    }
                    color={error ? "error" : "primary"}
                    variant="outlined"
                  />
                  {modulos.map((r) => (
                    <Chip
                      key={r.modulo}
                      label={`${r.modulo}: ${r.cantidad}`}
                      variant="outlined"
                    />
                  ))}
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
                          height: 36,
                        }}
                      >
                        <th>Módulo</th>
                        <th>Cantidad de Animales</th>
                        <th>Porcentaje sobre Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modulos.map((r) => (
                        <tr
                          key={r.modulo}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.modulo}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {r.cantidad}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 14 }}>
                            {total
                              ? `${((r.cantidad / total) * 100).toFixed(1)} %`
                              : "0 %"}
                          </td>
                        </tr>
                      ))}
                      {modulos.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "center",
                              fontSize: 14,
                              padding: 12,
                            }}
                          >
                            {error
                              ? "No se pudo obtener información del rebaño."
                              : "Sin datos de animales para mostrar."}
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
    </Box>
  );
}
