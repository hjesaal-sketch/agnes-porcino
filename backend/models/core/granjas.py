# backend/models/core/granjas.py
from typing import TYPE_CHECKING

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

if TYPE_CHECKING:
    from backend.models.core.Empresas import Empresa


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
