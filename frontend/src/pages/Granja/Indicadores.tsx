// src/pages/Granja/Indicadores.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { getKPIsGranja, KPIsGranja } from "../../services/granja/Indicadores";

export default function Indicadores() {
  const [kpis, setKpis] = useState<KPIsGranja | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getKPIsGranja();
      setKpis(data);
    })();
  }, []);

  return (
    <Card sx={{ mb: 3, maxWidth: 950, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs y Métricas Clave de la Granja
        </Typography>
        {kpis ? (
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Instalaciones (totales)</Typography>
              <Typography variant="h5">{kpis.totalInstalaciones}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Instalaciones operativas</Typography>
              <Typography variant="h5">{kpis.instalacionesOperativas}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Activos/equipos operativos</Typography>
              <Typography variant="h5">{kpis.activosOperativos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Personal total</Typography>
              <Typography variant="h5">{kpis.totalPersonal}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Personal activo</Typography>
              <Typography variant="h5">{kpis.personalActivo}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Servicios registrados</Typography>
              <Typography variant="h5">{kpis.totalServicios}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Servicios en mantenimiento</Typography>
              <Typography variant="h5">{kpis.serviciosEnMantenimiento}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Costos Fijos (total)</Typography>
              <Typography variant="h5">{kpis.costosFijos.toFixed(2)}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Costos Variables (total)</Typography>
              <Typography variant="h5">{kpis.costosVariables.toFixed(2)}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 150, textAlign: "center" }}>
              <Typography variant="subtitle2">Ventas</Typography>
              <Typography variant="h5">{kpis.ventas.toFixed(2)}</Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </CardContent>
    </Card>
  );
}
