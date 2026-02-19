# backend/seeds/dashboard_seed.py
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.Dashboard import (
    DashboardIndicador,
    DashboardEventoTarea,
    DashboardResumenReproductivo,
)

def seed_dashboard(db: Session):
    """Crea datos de prueba para el dashboard si no existen"""
    # Verificar si ya existen
    existing = db.query(DashboardIndicador).filter(
        DashboardIndicador.empresa_id == 1,
        DashboardIndicador.granja_id == 1,
    ).first()
    
    if existing:
        return  # Ya existen datos
    
    # Indicadores
    indicador = DashboardIndicador(
        empresa_id=1,
        granja_id=1,
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
            empresa_id=1,
            granja_id=1,
            tipo="destete",
            descripcion="Destete lote A-12",
            cantidad=3,
            fecha_evento=hoy + timedelta(days=2),
            completado=False,
        ),
        DashboardEventoTarea(
            empresa_id=1,
            granja_id=1,
            tipo="vacunacion",
            descripcion="Vacunación lechones",
            cantidad=4,
            fecha_evento=hoy + timedelta(days=1),
            completado=False,
        ),
        DashboardEventoTarea(
            empresa_id=1,
            granja_id=1,
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
            empresa_id=1,
            granja_id=1,
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
