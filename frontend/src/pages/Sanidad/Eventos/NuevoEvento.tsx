import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { crearEventoSanitario } from '../../../services/Sanidad';

const NuevoEvento: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_animal: 'hembra',
    animal_id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearEventoSanitario(formData);
      navigate('/sanidad');
    } catch (error) {
      console.error('Error creando evento:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#169b62', fontWeight: 700 }}>
          Registrar Evento Sanitario
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
            <TextField select label="Tipo de Animal" fullWidth required value={formData.tipo_animal} onChange={(e) => setFormData({...formData, tipo_animal: e.target.value})}>
              <MenuItem value="hembra">Hembra</MenuItem>
              <MenuItem value="verraco">Verraco</MenuItem>
            </TextField>
            <TextField label="ID del Animal" fullWidth required value={formData.animal_id} onChange={(e) => setFormData({...formData, animal_id: e.target.value})} />
            <TextField select label="Tipo de Evento" fullWidth required value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
              <MenuItem value="vacunacion">Vacunación</MenuItem>
              <MenuItem value="desparasitacion">Desparasitación</MenuItem>
              <MenuItem value="tratamiento">Tratamiento</MenuItem>
            </TextField>
            <TextField label="Fecha" type="date" fullWidth required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} InputLabelProps={{ shrink: true }} />
            <TextField label="ID Insumo" fullWidth required value={formData.insumo_id} onChange={(e) => setFormData({...formData, insumo_id: e.target.value})} />
            <TextField label="Dosis" fullWidth value={formData.dosis} onChange={(e) => setFormData({...formData, dosis: e.target.value})} />
            <TextField label="Unidad" fullWidth value={formData.unidad} onChange={(e) => setFormData({...formData, unidad: e.target.value})} placeholder="ml, mg, dosis" />
            <TextField label="Vía de Aplicación" fullWidth value={formData.via_aplicacion} onChange={(e) => setFormData({...formData, via_aplicacion: e.target.value})} placeholder="IM, SC, oral" />
            <TextField label="Lote del Medicamento" fullWidth value={formData.lote_medicamento} onChange={(e) => setFormData({...formData, lote_medicamento: e.target.value})} />
            <TextField label="Técnico" fullWidth value={formData.tecnico} onChange={(e) => setFormData({...formData, tecnico: e.target.value})} />
            <TextField label="Cantidad Consumida" fullWidth required value={formData.cantidad_consumida} onChange={(e) => setFormData({...formData, cantidad_consumida: e.target.value})} />
            <TextField label="Observaciones" fullWidth multiline rows={2} value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} sx={{ gridColumn: '1 / -1' }} />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/sanidad')}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#169b62' }}>Guardar</Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default NuevoEvento;