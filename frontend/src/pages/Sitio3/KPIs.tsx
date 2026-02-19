// src/pages/Sitio3/KPIs.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import { getKpisSitio3, KpiRow } from "../../services/sitio3/KPIs";

export default function Sitio3KPIs() {
  const [kpis, setKpis] = useState<KpiRow[]>([]);
  const [loteFiltro, setLoteFiltro] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getKpisSitio3();
        setKpis(data);
      } catch (e: any) {
        setErrorMsg(e.message || "Error cargando KPIs Sitio 3");
      }
    })();
  }, []);

  const lotes = useMemo(
    () => Array.from(new Set(kpis.map((i) => i.lote))),
    [kpis]
  );

  const filtrados = useMemo(
    () => (loteFiltro ? kpis.filter((k) => k.lote === loteFiltro) : kpis),
    [kpis, loteFiltro]
  );

  const resumen = useMemo(() => {
    if (!filtrados.length) return null;
    const totIng = filtrados.reduce((a, r) => a + r.animales_ingresados, 0);
    const totMort = filtrados.reduce((a, r) => a + r.mortalidad, 0);
    const kgVend = filtrados.reduce((a, r) => a + r.kg_vendidos, 0);
    const ingreso = filtrados.reduce((a, r) => a + r.ingreso_bruto, 0);
    const adgProm =
      filtrados.reduce((a, r) => a + (r.adg_est || 0), 0) / filtrados.length;
    const fcrProm =
      filtrados.reduce((a, r) => a + (r.fcr_est || 0), 0) / filtrados.length;
    return { totIng, totMort, kgVend, ingreso, adgProm, fcrProm };
  }, [filtrados]);

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs Productivos y Económicos – Sitio 3
        </Typography>

        {errorMsg && (
          <Typography color="error" sx={{ mb: 1 }}>
            {errorMsg}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Lote"
            select
            size="small"
            value={loteFiltro}
            onChange={(e) => setLoteFiltro(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {lotes.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {resumen && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            <Chip
              label={`Animales ingresados: ${resumen.totIng}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Mortalidad: ${resumen.totMort} (${(
                (resumen.totMort / (resumen.totIng || 1)) *
                100
              ).toFixed(1)}%)`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`ADG prom.: ${
                resumen.adgProm ? resumen.adgProm.toFixed(3) + " kg/d" : "N/D"
              }`}
              variant="outlined"
            />
            <Chip
              label={`FCR prom.: ${
                resumen.fcrProm ? resumen.fcrProm.toFixed(2) : "N/D"
              }`}
              variant="outlined"
            />
            <Chip
              label={`Kg vendidos: ${resumen.kgVend.toFixed(1)}`}
              variant="outlined"
            />
            <Chip
              label={`Ingreso bruto: ${resumen.ingreso.toFixed(2)}`}
              variant="outlined"
            />
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              marginBottom: 8,
              boxShadow: "0 1px 8px #0001",
              borderRadius: 10,
              overflow: "hidden",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#169b62", color: "#fff", height: 41 }}>
                <th>Lote</th>
                <th>Anim. Ingresados</th>
                <th>Mortalidad</th>
                <th>Mortalidad (%)</th>
                <th>ADG Est. (kg/d)</th>
                <th>FCR Est.</th>
                <th>Kg Vendidos</th>
                <th>Ingreso Bruto</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.lote} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ textAlign: "center", fontSize: 14 }}>{r.lote}</td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.animales_ingresados}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.mortalidad}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.mortalidad_pct.toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.adg_est ? r.adg_est.toFixed(3) : "N/D"}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.fcr_est ? r.fcr_est.toFixed(2) : "N/D"}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.kg_vendidos.toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 14 }}>
                    {r.ingreso_bruto.toFixed(2)}
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 12, fontSize: 14 }}
                  >
                    Sin datos de KPIs para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
}
