#backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.database import engine, Base
from backend.models.user import User
from backend.models.core.granjas import Granja  # importa Granja explícitamente
from backend.models.core.Empresas import Empresa  # modelo completo con relación granjas
from backend.utils.security import get_password_hash
from backend.seeds.dashboard_seed import seed_dashboard
from backend.database import SessionLocal  # ✅ CORRECTO

# Routers reales según tu árbol de carpetas
from backend.api.Auth import router as login_router
from backend.api.gestacion.Alertas import router as gestacion_alertas_router
from backend.api.gestacion.Madres import router as gestacion_madres_router
from backend.api.gestacion.Servicios import router as gestacion_servicios_router
from backend.api.gestacion.Partos import router as gestacion_partos_router
from backend.api.gestacion.Historial import router as gestacion_historial_router
from backend.api.gestacion.KPIs import router as gestacion_kpis_router
from backend.api.gestacion.Reportes import router as gestacion_reportes_router

from backend.api.maternidad import Alertas as MaternidadAlertasRouter
from backend.api.maternidad import Destete as MaternidadDesteteRouter
from backend.api.maternidad import Ingreso as MaternidadIngresosRouter
from backend.api.maternidad import Partos as MaternidadPartosRouter
from backend.api.maternidad import Lactancia as MaternidadLactanciaRouter
from backend.api.maternidad import Mortandad as MaternidadMortandadRouter
from backend.api.maternidad import Salud as MaternidadSaludRouter
from backend.api.maternidad import KPIs as MaternidadKPIsRouter
from backend.api.maternidad import Reportes as MaternidadReportesRouter

from backend.api.insumos import Alimentos as InsumosAlimentosRouter
from backend.api.insumos import Costos as InsumosCostosRouter
from backend.api.insumos import Equipos as InsumosEquiposRouter
from backend.api.insumos import Generales as InsumosGeneralesRouter
from backend.api.insumos import Limpieza as InsumosLimpiezaRouter
from backend.api.insumos import Medicamentos as InsumosMedicamentosRouter
from backend.api.insumos import Reportes as InsumosReportesRouter

from backend.api.granja import Bioseguridad as GranjaBioseguridadRouter
from backend.api.granja import Documentacion as GranjaDocumentacionRouter
from backend.api.granja import Economico as GranjaEconomicoRouter
from backend.api.granja import Entorno as GranjaEntornoRouter
from backend.api.granja import Equipos as GranjaEquiposRouter
from backend.api.granja import Indicadores as GranjaIndicadoresRouter
from backend.api.granja import Infraestructura as GranjaInfraestructuraRouter
from backend.api.granja import Instalaciones as GranjaInstalacionesRouter
from backend.api.granja import Personal as GranjaPersonalRouter
from backend.api.granja import Servicios as GranjaServiciosRouter
from backend.api.granja import Reportes as GranjaReportesRouter

from backend.api.genetica import Reproductores as GeneticaReproductoresRouter
from backend.api.genetica import Seminal as GeneticaSeminalRouter
from backend.api.genetica import Valoracion as GeneticaValoracionRouter
from backend.api.genetica import KPIs as GeneticaKPIsRouter
from backend.api.genetica import Reportes as GeneticaReportesRouter

from backend.api.sitio2 import Comercializacion as Sitio2ComercializacionRouter
from backend.api.sitio2 import Corrales as Sitio2CorralesRouter
from backend.api.sitio2 import Crecimiento as Sitio2CrecimientoRouter
from backend.api.sitio2 import Ingreso as Sitio2IngresoRouter
from backend.api.sitio2 import Mortalidad as Sitio2MortalidadRouter
from backend.api.sitio2 import Nutricion as Sitio2NutricionRouter
from backend.api.sitio2 import SaludBienestar as Sitio2SaludBienestarRouter
from backend.api.sitio2 import KPIs as Sitio2KPIsRouter
from backend.api.sitio2 import Reporte as Sitio2ReporteRouter

from backend.api.sitio3 import Comercializacion as Sitio3ComercializacionRouter
from backend.api.sitio3 import Corrales as Sitio3CorralesRouter
from backend.api.sitio3 import Crecimiento as Sitio3CrecimientoRouter
from backend.api.sitio3 import Ingreso as Sitio3IngresoRouter
from backend.api.sitio3 import Mortalidad as Sitio3MortalidadRouter
from backend.api.sitio3 import Nutricion as Sitio3NutricionRouter
from backend.api.sitio3 import SaludBienestar as Sitio3SaludRouter
from backend.api.sitio3 import KPIs as Sitio3KpisRouter
from backend.api.sitio3 import Reporte as Sitio3ReporteRouter

from backend.api.economico import Costos as EconomicoCostosRouter
from backend.api.economico import Egresos as EconomicoEgresosRouter
from backend.api.economico import Impuestos as EconomicoImpuestosRouter
from backend.api.economico import Ingresos as EconomicoIngresosRouter
from backend.api.economico import Reportes as EconomicoReportesRouter
from backend.api.economico import KPIs as EconomicoKPIsRouter

from backend.api.reportes.Productividad import router as reportes_productividad_router
from backend.api.reportes.Sanidad import router as reportes_sanidad_router
from backend.api.reportes.Nutricion import router as reportes_nutricion_router
from backend.api.reportes.Genetica import router as reportes_genetica_router
from backend.api.reportes.Costos import router as reportes_costos_router
from backend.api.reportes.Alertas import router as reportes_alertas_router

from backend.api.animales import Resumen as AnimalesResumenRouter
from backend.api.Productividad import router as productividad_router
from backend.api.Estadisticas import router as estadisticas_router
from backend.api.Usuarios import router as usuarios_router
from backend.api.Dashboard import router as dashboard_router
from backend.api.condicion_corporal import Backfat as BackfatRouter

# Creación de la app FastAPI
app = FastAPI(
    title="Gestión de Granjas",
    description="Backend API para plataforma de administración y producción porcina.",
    version="1.0.0",
)

# CORS: permite al frontend consumir la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://agnes-porcino.vercel.app"],   
        allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logs básicos
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# Si aún no usas migraciones, asegura que las tablas existan
Base.metadata.create_all(bind=engine)

# Monta routers bajo el prefijo /api
app.include_router(login_router, prefix="/api")
app.include_router(gestacion_alertas_router, prefix="/api")
app.include_router(gestacion_madres_router, prefix="/api")
app.include_router(gestacion_servicios_router, prefix="/api")
app.include_router(gestacion_partos_router, prefix="/api")
app.include_router(gestacion_historial_router, prefix="/api")
app.include_router(gestacion_kpis_router, prefix="/api")
app.include_router(gestacion_reportes_router, prefix="/api")

app.include_router(MaternidadAlertasRouter.router, prefix="/api")
app.include_router(MaternidadDesteteRouter.router, prefix="/api")
app.include_router(MaternidadIngresosRouter.router, prefix="/api")
app.include_router(MaternidadPartosRouter.router, prefix="/api")
app.include_router(MaternidadLactanciaRouter.router, prefix="/api")
app.include_router(MaternidadMortandadRouter.router, prefix="/api")
app.include_router(MaternidadSaludRouter.router, prefix="/api")
app.include_router(MaternidadKPIsRouter.router, prefix="/api")
app.include_router(MaternidadReportesRouter.router, prefix="/api")

app.include_router(InsumosAlimentosRouter.router, prefix="/api")
app.include_router(InsumosCostosRouter.router, prefix="/api")
app.include_router(InsumosEquiposRouter.router, prefix="/api")
app.include_router(InsumosGeneralesRouter.router, prefix="/api")
app.include_router(InsumosLimpiezaRouter.router, prefix="/api")
app.include_router(InsumosMedicamentosRouter.router, prefix="/api")
app.include_router(InsumosReportesRouter.router, prefix="/api")

app.include_router(GranjaBioseguridadRouter.router, prefix="/api")
app.include_router(GranjaDocumentacionRouter.router, prefix="/api")
app.include_router(GranjaEconomicoRouter.router, prefix="/api")
app.include_router(GranjaEntornoRouter.router, prefix="/api")
app.include_router(GranjaEquiposRouter.router, prefix="/api")
app.include_router(GranjaIndicadoresRouter.router, prefix="/api")
app.include_router(GranjaInfraestructuraRouter.router, prefix="/api")
app.include_router(GranjaInstalacionesRouter.router, prefix="/api")
app.include_router(GranjaPersonalRouter.router, prefix="/api")
app.include_router(GranjaServiciosRouter.router, prefix="/api")
app.include_router(GranjaReportesRouter.router, prefix="/api")

app.include_router(GeneticaReproductoresRouter.router, prefix="/api")
app.include_router(GeneticaSeminalRouter.router, prefix="/api")
app.include_router(GeneticaValoracionRouter.router, prefix="/api")
app.include_router(GeneticaKPIsRouter.router, prefix="/api")
app.include_router(GeneticaReportesRouter.router, prefix="/api")

app.include_router(Sitio2ComercializacionRouter.router, prefix="/api")
app.include_router(Sitio2CorralesRouter.router, prefix="/api")
app.include_router(Sitio2CrecimientoRouter.router, prefix="/api")
app.include_router(Sitio2IngresoRouter.router, prefix="/api")
app.include_router(Sitio2MortalidadRouter.router, prefix="/api")
app.include_router(Sitio2NutricionRouter.router, prefix="/api")
app.include_router(Sitio2SaludBienestarRouter.router, prefix="/api")
app.include_router(Sitio2KPIsRouter.router, prefix="/api")
app.include_router(Sitio2ReporteRouter.router, prefix="/api")

app.include_router(Sitio3ComercializacionRouter.router, prefix="/api")
app.include_router(Sitio3CorralesRouter.router, prefix="/api")
app.include_router(Sitio3CrecimientoRouter.router, prefix="/api")
app.include_router(Sitio3IngresoRouter.router, prefix="/api")
app.include_router(Sitio3MortalidadRouter.router, prefix="/api")
app.include_router(Sitio3NutricionRouter.router, prefix="/api")
app.include_router(Sitio3SaludRouter.router, prefix="/api")
app.include_router(Sitio3KpisRouter.router, prefix="/api")
app.include_router(Sitio3ReporteRouter.router, prefix="/api")

app.include_router(EconomicoCostosRouter.router, prefix="/api")
app.include_router(EconomicoEgresosRouter.router, prefix="/api")
app.include_router(EconomicoImpuestosRouter.router, prefix="/api")
app.include_router(EconomicoIngresosRouter.router, prefix="/api")
app.include_router(EconomicoReportesRouter.router, prefix="/api")
app.include_router(EconomicoKPIsRouter.router, prefix="/api")

app.include_router(reportes_productividad_router, prefix="/api")
app.include_router(reportes_sanidad_router, prefix="/api")
app.include_router(reportes_nutricion_router, prefix="/api")
app.include_router(reportes_genetica_router, prefix="/api")
app.include_router(reportes_costos_router, prefix="/api")
app.include_router(reportes_alertas_router, prefix="/api")

app.include_router(AnimalesResumenRouter.router, prefix="/api")
app.include_router(productividad_router, prefix="/api")
app.include_router(estadisticas_router, prefix="/api")
app.include_router(usuarios_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(BackfatRouter.router, prefix="/api")

@app.on_event("startup")
async def startup():
    """Ejecuta seed de datos al iniciar la aplicación"""
    db = SessionLocal()
    try:
        # Crear las tablas si no existen
        Base.metadata.create_all(bind=engine)
        
        # Crear usuario admin y empresa demo si no existen
        empresa_nombre = "Empresa Demo"
        
        empresa = db.query(Empresa).filter_by(nombre=empresa_nombre).first()
        if not empresa:
            empresa = Empresa(nombre=empresa_nombre)
            db.add(empresa)
            db.commit()
            db.refresh(empresa)
        
        admin_email = "admin@empresa.com"
        admin = db.query(User).filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                nombre="Admin General",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role="admin",
                empresa_id=empresa.id,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        seed_dashboard(db)
    except Exception as e:
        print(f"❌ Error al ejecutar seed: {e}")
    finally:
        db.close()

@app.get("/ping")
def ping():
    return {"status": "ok"}
