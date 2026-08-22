# backend/models/sanidad/Protocolos.py
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey

from backend.database import Base


class SanidadProtocolo(Base):
    __tablename__ = "sanidad_protocolos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(50), nullable=False)  # 'gestacion', 'maternidad', 'recria', 'engorde', 'verracos'
    tipo = Column(String(50), nullable=False)  # 'vacunacion', 'desparasitacion', 'tratamiento'
    insumo_id = Column(Integer, ForeignKey("supplies_medicines.id"), nullable=True)
    dosis_recomendada = Column(String(50), nullable=True)
    via_aplicacion = Column(String(50), nullable=True)
    edad_dias = Column(Integer, nullable=True)
    frecuencia_dias = Column(Integer, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )