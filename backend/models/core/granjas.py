# backend/models/core/granjas.py
from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base, engine
from backend.models.empresa import Empresa



    granjas = relationship("Granja", back_populates="empresa")


class Granja(Base):
    __tablename__ = "granjas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)

    nombre = Column(String(150), nullable=False)
    ubicacion = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    empresa = relationship("Empresa", back_populates="granjas")


# crear tablas
Base.metadata.create_all(bind=engine)
