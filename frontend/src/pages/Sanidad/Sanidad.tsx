import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { getEventosSanitarios } from '../../services/sanidad'; // COMENTADO TEMPORALMENTE

const Sanidad: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      // const data = await getEventosSanitarios();
      // setEventos(data);
      console.log('Servicio de sanidad pendiente de implementar');
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
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
  );
};

export default Sanidad;