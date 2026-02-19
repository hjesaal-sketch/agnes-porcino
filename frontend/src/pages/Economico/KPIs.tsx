// src/pages/Economico/KPIs.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Paper } from "@mui/material";
import {
  getKPIsEconomico,
  KPIsEconomico as KPIsEconomicoType,
} from "../../services/economico/KPIs";

export default function EconomicoKPIs() {
  const [kpis, setKpis] = useState<KPIsEconomicoType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getKPIsEconomico();
        setKpis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card sx={{ mb: 3, maxWidth: 900, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs y Métricas Económicas
        </Typography>
        {kpis ? (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Ingresos</Typography>
              <Typography variant="h5">
                {kpis.totalIngresos.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Egresos</Typography>
              <Typography variant="h5">
                {kpis.totalEgresos.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Costos fijos</Typography>
              <Typography variant="h5">
                {kpis.costosFijos.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Costos variables</Typography>
              <Typography variant="h5">
                {kpis.costosVariables.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Impuestos pagados</Typography>
              <Typography variant="h5">{kpis.impuestosPagados}</Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Impuestos pendientes</Typography>
              <Typography variant="h5">{kpis.impuestosPendientes}</Typography>
            </Paper>
            <Paper
              elevation={2}
              sx={{ p: 2, minWidth: 125, textAlign: "center" }}
            >
              <Typography variant="subtitle2">Saldo final</Typography>
              <Typography variant="h5">
                {kpis.saldoFinal.toLocaleString("es-CO", {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>{loading ? "Cargando..." : "Sin datos"}</Typography>
        )}
      </CardContent>
    </Card>
  );
}
