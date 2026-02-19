// src/pages/Genetica/KPIs.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { getKPIsGenetica, KPIsGenetica } from "../../services/genetica/KPIs";

export default function GeneticaKPIs() {
  const [kpis, setKpis] = useState<KPIsGenetica | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getKPIsGenetica();
        setKpis(data);
      } catch (e) {
        // si quieres, aquí podrías manejar error (snackbar, etc.)
        console.error(e);
      }
    })();
  }, []);

  return (
    <Card sx={{ mb: 3, maxWidth: 900, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs y Métricas Genéticas
        </Typography>
        {kpis ? (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Verracos registrados</Typography>
              <Typography variant="h5">{kpis.totalVerracos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Activos</Typography>
              <Typography variant="h5">{kpis.activos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Reposo</Typography>
              <Typography variant="h5">{kpis.enReposo}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Baja</Typography>
              <Typography variant="h5">{kpis.baja}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Valoraciones genéticas</Typography>
              <Typography variant="h5">{kpis.totalValoraciones}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Score promedio</Typography>
              <Typography variant="h5">{kpis.promedioScore}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Registros seminales</Typography>
              <Typography variant="h5">{kpis.totalSeminales}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Calidad excelente</Typography>
              <Typography variant="h5">{kpis.calidadExcelente}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Calidad deficiente</Typography>
              <Typography variant="h5">{kpis.calidadDeficiente}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 125, textAlign: "center" }}>
              <Typography variant="subtitle2">Prom. concentración</Typography>
              <Typography variant="h5">{kpis.promedioConcentracion}</Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </CardContent>
    </Card>
  );
}
