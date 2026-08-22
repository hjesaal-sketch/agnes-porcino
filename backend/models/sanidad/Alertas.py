# backend/models/sanidad/Alertas.py
from __future__ import annotations

from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey

from backend.database import Base


class SanidadAlerta(Base):
    __tablename__ = "sanidad_alertas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    evento_id = Column(Integer, ForeignKey("sanidad_eventos.id"), nullable=True)
    tipo = Column(String(50), nullable=False)  # 'vencimiento', 'atraso', 'stock_bajo'
    mensaje = Column(Text, nullable=False)
    fecha_esperada = Column(Date, nullable=True)
    fecha_atencion = Column(Date, nullable=True)
    atendida = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)