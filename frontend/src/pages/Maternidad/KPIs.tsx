// src/pages/Maternidad/KPIs.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { getKPIsMaternidad } from "../../services/maternidad/KPIs";

type KPIsMaternidad = {
  totalMadres: number;
  totalPartos: number;
  totalLechonesVivos: number;
  totalLechonesMuertos: number;
  mortalidadLechones: number;
  mortalidadMadres: number;
  promedioLechonesVivos: string;
  promedioDestetados: string;
  tasaMortalidadLechones: string;
  totalDestetados: number;
};

export default function KPIs() {
  const [kpis, setKpis] = useState<KPIsMaternidad | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getKPIsMaternidad();
      setKpis(data);
    })();
  }, []);

  return (
    <Card sx={{ mb: 3, maxWidth: 750, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Indicadores de KPIs y Productividad Maternidad
        </Typography>
        {kpis ? (
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Madres ingresadas</Typography>
              <Typography variant="h5">{kpis.totalMadres}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Partos registrados</Typography>
              <Typography variant="h5">{kpis.totalPartos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">
                Promedio lechones vivos por parto
              </Typography>
              <Typography variant="h5">{kpis.promedioLechonesVivos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">
                Promedio lechones destetados
              </Typography>
              <Typography variant="h5">{kpis.promedioDestetados}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Total lechones muertos</Typography>
              <Typography variant="h5">{kpis.totalLechonesMuertos}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">
                Tasa mortalidad lechones (%)
              </Typography>
              <Typography variant="h5">{kpis.tasaMortalidadLechones}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, minWidth: 160, textAlign: "center" }}>
              <Typography variant="subtitle2">Mortalidad madres</Typography>
              <Typography variant="h5">{kpis.mortalidadMadres}</Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </CardContent>
    </Card>
  );
}
