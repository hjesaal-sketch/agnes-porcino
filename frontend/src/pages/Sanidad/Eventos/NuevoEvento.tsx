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
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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
import { crearEventoSanitario } from '../../../services/Sanidad';
import { getLotes } from '../../../services/Lotes';

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

const NuevoEvento: React.FC = () => {
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [tipoRegistro, setTipoRegistro] = useState('individual');
  const [formData, setFormData] = useState({
    tipo_animal: 'hembra',
    animal_id: '',
    lote_id: '',
    cantidad_animales: 0,
    tipo: 'vacunacion',
    fecha: '',
    insumo_id: '',
    dosis: '',
    unidad: '',
    via_aplicacion: '',
    lote_medicamento: '',
    tecnico: '',
    observaciones: '',
    cantidad_consumida: '',
  });

  useEffect(() => {
    cargarLotes();
  }, []);

  const cargarLotes = async () => {
    try {
      const data = await getLotes();
      setLotes(data);
    } catch (error) {
      console.error('Error cargando lotes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        animal_id: tipoRegistro === 'individual' ? parseInt(formData.animal_id) : null,
        lote_id: tipoRegistro === 'lote' ? parseInt(formData.lote_id) : null,
        cantidad_animales: tipoRegistro === 'lote' ? parseInt(formData.cantidad_animales) : 0,
      };
      await crearEventoSanitario(payload);
      navigate('/sanidad');
    } catch (error) {
      console.error('Error creando evento:', error);
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
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#169b62', fontWeight: 700 }}>
              Registrar Evento Sanitario
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Registro</InputLabel>
                  <Select
                    value={tipoRegistro}
                    label="Tipo de Registro"
                    onChange={(e) => setTipoRegistro(e.target.value)}
                  >
                    <MenuItem value="individual">Animal específico</MenuItem>
                    <MenuItem value="lote">Lote / Grupo</MenuItem>
                  </Select>
                </FormControl>

                {tipoRegistro === 'individual' ? (
                  <>
                    <TextField
                      select
                      label="Tipo de Animal"
                      fullWidth
                      required
                      value={formData.tipo_animal}
                      onChange={(e) => setFormData({...formData, tipo_animal: e.target.value})}
                    >
                      <MenuItem value="hembra">Hembra</MenuItem>
                      <MenuItem value="verraco">Verraco</MenuItem>
                    </TextField>
                    <TextField
                      label="ID del Animal"
                      fullWidth
                      required
                      value={formData.animal_id}
                      onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                    />
                  </>
                ) : (
                  <>
                    <TextField
                      select
                      label="Lote"
                      fullWidth
                      required
                      value={formData.lote_id}
                      onChange={(e) => setFormData({...formData, lote_id: e.target.value})}
                    >
                      {lotes.map((lote: any) => (
                        <MenuItem key={lote.id} value={lote.id}>
                          {lote.nombre} ({lote.cantidad_animales} animales)
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Cantidad de Animales"
                      type="number"
                      fullWidth
                      required
                      value={formData.cantidad_animales}
                      onChange={(e) => setFormData({...formData, cantidad_animales: e.target.value})}
                    />
                  </>
                )}

                <TextField
                  select
                  label="Tipo de Evento"
                  fullWidth
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <MenuItem value="vacunacion">Vacunación</MenuItem>
                  <MenuItem value="desparasitacion">Desparasitación</MenuItem>
                  <MenuItem value="tratamiento">Tratamiento</MenuItem>
                </TextField>
                <TextField
                  label="Fecha"
                  type="date"
                  fullWidth
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="ID Insumo"
                  fullWidth
                  required
                  value={formData.insumo_id}
                  onChange={(e) => setFormData({...formData, insumo_id: e.target.value})}
                />
                <TextField
                  label="Dosis por Animal"
                  fullWidth
                  value={formData.dosis}
                  onChange={(e) => setFormData({...formData, dosis: e.target.value})}
                />
                <TextField
                  label="Unidad"
                  fullWidth
                  value={formData.unidad}
                  onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                  placeholder="ml, mg, dosis"
                />
                <TextField
                  label="Vía de Aplicación"
                  fullWidth
                  value={formData.via_aplicacion}
                  onChange={(e) => setFormData({...formData, via_aplicacion: e.target.value})}
                  placeholder="IM, SC, oral"
                />
                <TextField
                  label="Lote del Medicamento"
                  fullWidth
                  value={formData.lote_medicamento}
                  onChange={(e) => setFormData({...formData, lote_medicamento: e.target.value})}
                />
                <TextField
                  label="Técnico"
                  fullWidth
                  value={formData.tecnico}
                  onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
                />
                <TextField
                  label="Cantidad Consumida (por animal)"
                  type="number"
                  fullWidth
                  required
                  value={formData.cantidad_consumida}
                  onChange={(e) => setFormData({...formData, cantidad_consumida: e.target.value})}
                  helperText={tipoRegistro === 'lote' ? 'Se multiplicará por la cantidad de animales' : ''}
                />
                <TextField
                  label="Observaciones"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  sx={{ gridColumn: '1 / -1' }}
                />
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/sanidad')}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#169b62' }}>
                  Guardar
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default NuevoEvento;