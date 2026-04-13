# backend/seeds/dashboard_seed.py
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.Dashboard import (
    DashboardIndicador,
    DashboardEventoTarea,
    DashboardResumenReproductivo,
)
from backend.models.core.granjas import Granja  # Crear granja demo si no existe
from backend.models.core.Empresas import Empresa

def seed_dashboard(db: Session):
    """Crea datos de prueba para el dashboard si no existen"""
    # Crear empresa y granja demo si no existen (para que el seed del dashboard tenga FK válidas)
    empresa = db.query(Empresa).filter_by(nombre="Empresa Demo").first()
    if not empresa:
        empresa = Empresa(nombre="Empresa Demo")
        db.add(empresa)
        db.commit()
        db.refresh(empresa)

    granja = db.query(Granja).filter_by(nombre="Granja Demo").first()
    if not granja:
        granja = Granja(
            empresa_id=empresa.id,
            nombre="Granja Demo",
            ubicacion="Ubicación por defecto",
        )
        db.add(granja)
        db.commit()
        db.refresh(granja)

    empresa_id = empresa.id
    granja_id = granja.id

    # Verificar si ya existen datos del dashboard
    existing = db.query(DashboardIndicador).filter(
        DashboardIndicador.empresa_id == empresa_id,
        DashboardIndicador.granja_id == granja_id,
    ).first()

    if existing:
        return  # Ya existen datosn  


    
    # Indicadores
    indicador = DashboardIndicador(
        empresa_id=empresa_id,
        granja_id=granja_id,
        proximos_partos=4,
        fallos_reproductivos=2,
        mortalidad=1,
        alimento_bajo=230,
        medicamento_bajo=5,
        celos_recientes=6,
        listos_destete=13,
    )
    db.add(indicador)
    
    # Eventos/tareas
    hoy = datetime.utcnow()
    eventos = [
        DashboardEventoTarea(
            empresa_id=empresa_id,
            granja_id=granja_id,
            tipo="destete",
            descripcion="Destete lote A-12",
            cantidad=3,
            fecha_evento=hoy + timedelta(days=2),
            completado=False,
        ),
        DashboardEventoTarea(
            empresa_id=empresa_id,
            granja_id=granja_id,
            tipo="vacunacion",
            descripcion="Vacunación lechones",
            cantidad=4,
            fecha_evento=hoy + timedelta(days=1),
            completado=False,
        ),
        DashboardEventoTarea(
            empresa_id=empresa_id,
            granja_id=granja_id,
            tipo="parto",
            descripcion="Hembras a parto",
            cantidad=2,
            fecha_evento=hoy,
            completado=False,
        ),
    ]
    db.add_all(eventos)
    
    # Resumen reproductivo (últimos 6 meses)
    meses = ["Septiembre", "Octubre", "Noviembre", "Diciembre", "Enero", "Febrero"]
    resumenes = [
        DashboardResumenReproductivo(
            empresa_id=empresa_id,
            granja_id=granja_id,
            mes=mes,
            partos=45 + i * 3,
            fallos=8 - i,
            mortalidad=3 + i,
            destetes=42 + i * 2,
        )
        for i, mes in enumerate(meses)
    ]
    db.add_all(resumenes)
    
    db.commit()
    print("✅ Dashboard seed completado")
