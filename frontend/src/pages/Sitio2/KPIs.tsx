// src/pages/Sitio2/KPIs.tsx
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
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { getSitio2KpiInput, Sitio2KpiInput } from "../../services/sitio2/KPIs";

type KpiRow = {
  lote: string;
  animales_ingresados: number;
  mortalidad: number;
  mortalidad_pct: number;
  adg_est: number | null;
  fcr_est: number | null;
};

type UiAlertState = { msg: string; type: "success" | "error" } | null;

function calcularKpisSitio2(data: Sitio2KpiInput): KpiRow[] {
  const porLote = new Map<string, KpiRow>();

  data.ingresos.forEach((ing) => {
    porLote.set(ing.lote, {
      lote: ing.lote,
      animales_ingresados: ing.cantidad,
      mortalidad: 0,
      mortalidad_pct: 0,
      adg_est: null,
      fcr_est: null,
    });
  });

  data.mortalidad.forEach((m) => {
    const row = porLote.get(m.lote);
    if (!row) return;
    row.mortalidad += m.cantidad;
  });

  porLote.forEach((row) => {
    if (row.animales_ingresados > 0) {
      row.mortalidad_pct = (row.mortalidad / row.animales_ingresados) * 100;
    }
  });

  data.crecimientos.forEach((c) => {
    const ing = data.ingresos.find((i) => i.lote === c.lote);
    if (!ing) return;
    const row = porLote.get(c.lote);
    if (!row) return;

    const pesoIni = ing.peso_promedio;
    const pesoFin = c.peso_promedio;
    const dias = 20; // TODO: calcular con fechas reales
    if (dias > 0 && pesoFin > pesoIni) {
      row.adg_est = (pesoFin - pesoIni) / dias;
    }

    const totalAlimento = data.nutricion
      .filter((n) => n.lote === c.lote)
      .reduce((acc, n) => acc + n.alimento_consumido, 0);
    const kgGanados = (pesoFin - pesoIni) * c.cantidad_pesada;
    if (kgGanados > 0 && totalAlimento > 0) {
      row.fcr_est = totalAlimento / kgGanados;
    }
  });

  return Array.from(porLote.values());
}

export default function Sitio2KPIs() {
  const [input, setInput] = useState<Sitio2KpiInput | null>(null);
  const [loteFiltro, setLoteFiltro] = useState<string>("");
  const [uiAlert, setUiAlert] = useState<UiAlertState>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSitio2KpiInput();
        setInput(data);
      } catch (e: any) {
        console.error(e);
        setUiAlert({
          msg: e.message || "Error cargando datos para KPIs Sitio 2",
          type: "error",
        });
      }
    })();
  }, []);

  const kpis = useMemo(
    () => (input ? calcularKpisSitio2(input) : []),
    [input]
  );

  const lotes = useMemo(
    () =>
      input
        ? Array.from(new Set(input.ingresos.map((i) => i.lote)))
        : [],
    [input]
  );

  const filtrados = useMemo(
    () => (loteFiltro ? kpis.filter((k) => k.lote === loteFiltro) : kpis),
    [kpis, loteFiltro]
  );

  const resumen = useMemo(() => {
    if (!filtrados.length) return null;
    const totIng = filtrados.reduce((a, r) => a + r.animales_ingresados, 0);
    const totMort = filtrados.reduce((a, r) => a + r.mortalidad, 0);
    const adgProm =
      filtrados.reduce((a, r) => a + (r.adg_est || 0), 0) / filtrados.length;
    const fcrProm =
      filtrados.reduce((a, r) => a + (r.fcr_est || 0), 0) / filtrados.length;
    return { totIng, totMort, adgProm, fcrProm };
  }, [filtrados]);

  const handleCloseSnackbar = () => setUiAlert(null);

  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 980, boxSizing: "border-box" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          KPIs Productivos – Sitio 2
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Lote"
            select
            size="small"
            value={loteFiltro}
            onChange={(e) => setLoteFiltro(e.target.value)}
            sx={{ minWidth: 180 }}
            disabled={!lotes.length}
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
              label={`ADG estimada prom.: ${
                resumen.adgProm ? resumen.adgProm.toFixed(3) + " kg/d" : "N/D"
              }`}
              variant="outlined"
            />
            <Chip
              label={`FCR estimada prom.: ${
                resumen.fcrProm ? resumen.fcrProm.toFixed(2) : "N/D"
              }`}
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
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", fontSize: 14, padding: 12 }}
                  >
                    Sin datos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Snackbar
          open={!!uiAlert}
          autoHideDuration={3200}
          onClose={handleCloseSnackbar}
        >
          {uiAlert ? (
            <MuiAlert
              onClose={handleCloseSnackbar}
              severity={uiAlert.type}
              sx={{ width: "100%" }}
            >
              {uiAlert.msg}
            </MuiAlert>
          ) : undefined}
        </Snackbar>
      </CardContent>
    </Card>
  );
}
