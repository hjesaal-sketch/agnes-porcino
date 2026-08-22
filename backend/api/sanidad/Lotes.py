# backend/api/sanidad/Lotes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models.sanidad.Lotes import SanidadLote
from backend.schemas.sanidad.Lotes import SanidadLoteCreate, SanidadLoteResponse

router = APIRouter(prefix="/api/sanidad/lotes", tags=["Sanidad - Lotes"])

@router.get("/", response_model=List[SanidadLoteResponse])
def get_lotes(
    empresa_id: int = Query(...),
    granja_id: int = Query(...),
    categoria: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SanidadLote).filter(
        SanidadLote.empresa_id == empresa_id,
        SanidadLote.granja_id == granja_id
    )
    if categoria:
        query = query.filter(SanidadLote.categoria == categoria)
    return query.order_by(SanidadLote.nombre).all()

@router.post("/", response_model=SanidadLoteResponse)
def crear_lote(lote: SanidadLoteCreate, db: Session = Depends(get_db)):
    db_lote = SanidadLote(**lote.dict())
    db.add(db_lote)
    db.commit()
    db.refresh(db_lote)
    return db_lote