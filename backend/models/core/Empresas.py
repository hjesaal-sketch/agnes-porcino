# backend/models/core/Empresas.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship, Mapped

from backend.database import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False, unique=True)
    rif = Column(String(50), nullable=True, unique=True)
    direccion = Column(Text, nullable=True)
    telefono = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relación con granjas
    Mapped[List["Granja"]] = relationship(
        "Granja",
        back_populates="empresa",
        cascade="all, delete-orphan",
    )
