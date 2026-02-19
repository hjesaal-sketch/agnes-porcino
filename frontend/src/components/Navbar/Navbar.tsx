// src/components/Navbar/Navbar.tsx
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
};

const SIDEBAR_WIDTH = 220;

export default function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const [anchorGestion, setAnchorGestion] =
    React.useState<null | HTMLElement>(null);
  const [anchorProd, setAnchorProd] =
    React.useState<null | HTMLElement>(null);

  // Recría = Sitio 2, Engorde = Sitio 3
  const gestionItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Granja", path: "/granja" },
    { label: "Animales", path: "/animales" },
    { label: "Gestación", path: "/gestacion" },
    { label: "Maternidad", path: "/maternidad" },
    { label: "Recría", path: "/sitio2" },
    { label: "Engorde", path: "/sitio3" },
  ];

  const productividadItems = [
    { label: "Indicadores", path: "/productividad" },
    { label: "Historial Productivo", path: "/historial-productivo" },
  ];

  if (!isAuthenticated) return null;

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "#169b62",
        color: "#fff",
        boxShadow: "none",
        zIndex: 1201,
        left: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
        width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1.5em",
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 1.5,
              cursor: "pointer",
              mr: 3,
            }}
            onClick={() => navigate("/dashboard")}
          >
            AGNES
          </Typography>

          {/* GESTIÓN */}
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 700 }}
            aria-controls={anchorGestion ? "menu-gestion" : undefined}
            aria-haspopup="true"
            onClick={(e) => setAnchorGestion(e.currentTarget)}
          >
            GESTIÓN
          </Button>
          <Menu
            id="menu-gestion"
            anchorEl={anchorGestion}
            open={Boolean(anchorGestion)}
            onClose={() => setAnchorGestion(null)}
            MenuListProps={{ sx: { minWidth: 200 } }}
          >
            {gestionItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  setAnchorGestion(null);
                  navigate(item.path);
                }}
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          {/* PRODUCTIVIDAD */}
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 700 }}
            aria-controls={anchorProd ? "menu-prod" : undefined}
            aria-haspopup="true"
            onClick={(e) => setAnchorProd(e.currentTarget)}
          >
            PRODUCTIVIDAD
          </Button>
          <Menu
            id="menu-prod"
            anchorEl={anchorProd}
            open={Boolean(anchorProd)}
            onClose={() => setAnchorProd(null)}
            MenuListProps={{ sx: { minWidth: 180 } }}
          >
            {productividadItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={() => {
                  setAnchorProd(null);
                  navigate(item.path);
                }}
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          {/* ENLACES DIRECTOS */}
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 700 }}
            onClick={() => navigate("/estadisticas")}
          >
            ESTADÍSTICAS
          </Button>
          <Button
            color="inherit"
            sx={{ mx: 1, fontWeight: 700 }}
            onClick={() => navigate("/usuarios")}
          >
            USUARIOS
          </Button>

          {/* CERRAR SESIÓN */}
          <Button
            color="error"
            variant="contained"
            sx={{ ml: 2, fontWeight: 800, boxShadow: "none" }}
            onClick={onLogout}
          >
            CERRAR SESIÓN
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
