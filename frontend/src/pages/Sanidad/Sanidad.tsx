import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Container,
  Paper,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BabyIcon from '@mui/icons-material/BabyChangingStation';
import AgriculturalIcon from '@mui/icons-material/Agriculture';
import InventoryIcon from '@mui/icons-material/Inventory';
import ScienceIcon from '@mui/icons-material/Science';
import RoomIcon from '@mui/icons-material/Room';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import InfoIcon from '@mui/icons-material/Info';
import { getEventosSanitarios } from '../../services/Sanidad';

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

const Sanidad: React.FC = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const data = await getEventosSanitarios();
      console.log('Eventos sanitarios:', data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#0e2e1f',
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 1 }}>
            AGNES
          </Typography>
        </Box>
        <List>
          {menu.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                color: window.location.pathname === item.path ? '#169b62' : '#fff',
                background: window.location.pathname === item.path ? 'rgba(22, 155, 98, 0.09)' : 'none',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'inherit' }} />
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
          minHeight: '100vh',
          backgroundColor: '#f5f7f9',
        }}
      >
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#169b62', fontWeight: 700 }}>
              Módulo de Sanidad
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Gestión de vacunaciones, desparasitaciones y tratamientos
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => navigate('/sanidad/eventos/nuevo')}>
                Registrar Evento
              </Button>
              <Button variant="outlined" onClick={() => navigate('/sanidad/protocolos')}>
                Protocolos
              </Button>
              <Button variant="outlined" onClick={() => navigate('/sanidad/alertas')}>
                Alertas
              </Button>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
              <Tab label="Historial" />
              <Tab label="Próximos Eventos" />
              <Tab label="Estadísticas" />
            </Tabs>

            {tab === 0 && (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Historial de eventos sanitarios (en construcción)
                </Typography>
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Próximos eventos programados (en construcción)
                </Typography>
              </Box>
            )}

            {tab === 2 && (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Estadísticas sanitarias (en construcción)
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Sanidad;