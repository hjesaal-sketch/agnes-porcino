// src/pages/Gestacion/KPIs.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { getKPIsGestacion } from "../../services/gestacion/KPIs";

type KPIsGestacion = Awaited<ReturnType<typeof getKPIsGestacion>>;

export default function GestacionKPIs() {
  const [kpis, setKpis] = useState<KPIsGestacion | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getKPIsGestacion();
      setKpis(data);
    })();
  }, []);

  return (
    <Card sx={{ mb: 3, maxWidth: 750, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Indicadores Clave de Gestación
        </Typography>
        {kpis ? (
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Madres registradas</Typography>
              <Typography variant="h5">{kpis.totalMadres}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Servicios realizados</Typography>
              <Typography variant="h5">{kpis.totalServicios}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Partos registrados</Typography>
              <Typography variant="h5">{kpis.totalPartos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Tasa preñez (%)</Typography>
              <Typography variant="h5">{kpis.tasaPrenez}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Eficiencia (%)</Typography>
              <Typography variant="h5">{kpis.eficiencia}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Abortos</Typography>
              <Typography variant="h5">{kpis.abortos}</Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </CardContent>
    </Card>
  );
}
