# backend/api/sanidad/Eventos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.database import get_db
from backend.models.sanidad.Eventos import SanidadEvento
from backend.models.insumos.Medicamentos import MedicamentoModel
from backend.schemas.sanidad.Eventos import SanidadEventoCreate, SanidadEventoResponse

router = APIRouter(prefix="/api/sanidad/eventos", tags=["Sanidad - Eventos"])

@router.post("/", response_model=SanidadEventoResponse)
def crear_evento(
    evento: SanidadEventoCreate,
    db: Session = Depends(get_db)
):
    """Registrar un nuevo evento sanitario. Descuenta automáticamente el insumo."""
    
    # 1. Verificar que el insumo existe
    insumo = db.query(MedicamentoModel).filter(MedicamentoModel.id == evento.insumo_id).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    
    # 2. Verificar stock suficiente
    if insumo.stock < evento.cantidad_consumida:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    
    # 3. Crear el evento
    db_evento = SanidadEvento(**evento.dict())
    db.add(db_evento)
    
    # 4. Descontar stock
    insumo.stock -= evento.cantidad_consumida
    
    db.commit()
    db.refresh(db_evento)
    return db_evento

@router.get("/animal/{animal_id}", response_model=List[SanidadEventoResponse])
def get_eventos_por_animal(
    animal_id: int,
    tipo_animal: str = Query(..., description="'hembra' o 'verraco'"),
    db: Session = Depends(get_db)
):
    """Obtener todo el historial sanitario de un animal específico."""
    eventos = db.query(SanidadEvento).filter(
        SanidadEvento.animal_id == animal_id,
        SanidadEvento.tipo_animal == tipo_animal
    ).order_by(SanidadEvento.fecha.desc()).all()
    
    return eventos

@router.get("/", response_model=List[SanidadEventoResponse])
def get_eventos(
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    tipo: Optional[str] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Listar eventos con filtros."""
    query = db.query(SanidadEvento).filter(
        SanidadEvento.empresa_id == empresa_id,
        SanidadEvento.granja_id == granja_id
    )
    
    if tipo:
        query = query.filter(SanidadEvento.tipo == tipo)
    if fecha_desde:
        query = query.filter(SanidadEvento.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(SanidadEvento.fecha <= fecha_hasta)
    
    return query.order_by(SanidadEvento.fecha.desc()).offset(skip).limit(limit).all()