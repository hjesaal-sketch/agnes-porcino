import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  GridLegacy as Grid,
  Chip,
} from "@mui/material";
import {
  Agriculture,
  Scale,
  Psychology,
  Update,
  Build,
} from "@mui/icons-material";

export default function AcercaDe() {
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: "#169b62",
              fontWeight: 800,
              letterSpacing: 2,
              mb: 1,
            }}
          >
            AGNES
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#2d3748",
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            Agricultural &amp; Granja Nexus Enterprise System
          </Typography>
          <Chip
            label="v1.0.0"
            size="small"
            sx={{ mt: 1, bgcolor: "#169b62", color: "#fff" }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Descripción */}
        <Typography variant="body1" paragraph sx={{ textAlign: "justify" }}>
          AGNES es un sistema de gestión inteligente diseñado para optimizar la
          operación de granjas porcinas, integrando módulos de control
          reproductivo, sanitario, productivo y económico. Su arquitectura
          modular y escalable permite adaptarse a distintos tipos de
          explotaciones pecuarias, garantizando trazabilidad y toma de
          decisiones basada en datos.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Agriculture sx={{ color: "#169b62" }} />
              <Typography variant="body2">
                <strong>Gestión porcina:</strong> Control de gestación,
                maternidad, recría y engorde.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Scale sx={{ color: "#169b62" }} />
              <Typography variant="body2">
                <strong>Escalable:</strong> Adaptable a otros tipos de granjas
                (bovinos, aves, etc.).
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Psychology sx={{ color: "#169b62" }} />
              <Typography variant="body2">
                <strong>Inteligencia aplicada:</strong> Indicadores y alertas
                tempranas para decisiones estratégicas.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Build sx={{ color: "#169b62" }} />
              <Typography variant="body2">
                <strong>Arquitectura moderna:</strong> FastAPI, React, Supabase
                y despliegue en la nube.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Créditos */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#169b62",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Desarrollo
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            <span style={{ color: "#2d3748" }}>Idea, dirección y desarrollo:</span>{" "}
            <span style={{ color: "#169b62", fontWeight: 700 }}>
              Henry Esaá
            </span>
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            <span style={{ fontWeight: 500 }}>Plataforma tecnológica:</span>{" "}
            FastAPI · React · Material-UI · Supabase · Render · Vercel
          </Typography>

          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#f0f4f1",
              borderRadius: 2,
              borderLeft: "4px solid #169b62",
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              “AGNES representa un paso hacia la agricultura inteligente,
              combinando tecnología de vanguardia con las necesidades reales del
              productor.”
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} · Todos los derechos reservados
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>EOS Connecting</strong> · Transformando el agro
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}