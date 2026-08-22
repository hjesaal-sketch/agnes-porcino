# backend/models/sanidad/Eventos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey

from backend.database import Base


class SanidadEvento(Base):
    __tablename__ = "sanidad_eventos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    # Opción 1: Animal específico
    tipo_animal = Column(String(20), nullable=True)  # 'hembra', 'verraco'
    animal_id = Column(Integer, nullable=True)       # NULL si es lote

    # Opción 2: Lote
    lote_id = Column(Integer, ForeignKey("sanidad_lotes.id"), nullable=True)
    cantidad_animales = Column(Integer, default=0)

    # Datos del evento
    tipo = Column(String(50), nullable=False)  # 'vacunacion', 'desparasitacion', 'tratamiento'
    fecha = Column(Date, nullable=False)
    insumo_id = Column(Integer, ForeignKey("supplies_medicines.id"), nullable=False)
    dosis = Column(Float, nullable=True)
    unidad = Column(String(20), nullable=True)
    via_aplicacion = Column(String(50), nullable=True)
    lote_medicamento = Column(String(50), nullable=True)
    tecnico = Column(String(100), nullable=True)
    observaciones = Column(Text, nullable=True)

    # Consumo automático
    cantidad_consumida = Column(Float, nullable=True)
    costo_total = Column(Float, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )