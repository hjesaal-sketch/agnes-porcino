import api from './api';

export const getEventosSanitarios = async () => {
  const response = await api.get('/sanidad/eventos', {
    params: {
      empresa_id: localStorage.getItem('empresa_id'),
      granja_id: localStorage.getItem('granja_id'),
    }
  });
  return response.data;
};

export const crearEventoSanitario = async (data: any) => {
  const response = await api.post('/sanidad/eventos', data);
  return response.data;
};