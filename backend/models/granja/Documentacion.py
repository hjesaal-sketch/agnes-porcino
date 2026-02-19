# backend/models/granja/Documentacion.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class DocumentoModel(Base):
    __tablename__ = "farm_documents"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    tipo = Column(String(80), nullable=False)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    responsable = Column(String(120), nullable=True)
    estado = Column(String(30), nullable=False)
    observaciones = Column(Text, nullable=True)
    file_url = Column(String(400), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ========= Pydantic =========

class DocumentoBase(BaseModel):
    empresa_id: int
    granja_id: int
    fecha: date
    tipo: str
    titulo: str
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    estado: str
    observaciones: Optional[str] = None
    file_url: Optional[str] = None


class DocumentoCreate(DocumentoBase):
    pass


class DocumentoUpdate(BaseModel):
    fecha: Optional[date] = None
    tipo: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None
    file_url: Optional[str] = None


class DocumentoRead(DocumentoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========= Repositorio =========

class DocumentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self, empresa_id: int, granja_id: int
    ) -> List[DocumentoModel]:
        return (
            self.db.query(DocumentoModel)
            .filter(
                DocumentoModel.empresa_id == empresa_id,
                DocumentoModel.granja_id == granja_id,
            )
            .order_by(DocumentoModel.fecha.desc(), DocumentoModel.id.desc())
            .all()
        )

    def obtener_por_id(
        self, doc_id: int, empresa_id: int, granja_id: int
    ) -> Optional[DocumentoModel]:
        return (
            self.db.query(DocumentoModel)
            .filter(
                DocumentoModel.id == doc_id,
                DocumentoModel.empresa_id == empresa_id,
                DocumentoModel.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: DocumentoCreate) -> DocumentoModel:
        reg = DocumentoModel(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha=data.fecha,
            tipo=data.tipo,
            titulo=data.titulo,
            descripcion=data.descripcion,
            responsable=data.responsable,
            estado=data.estado,
            observaciones=data.observaciones,
            file_url=data.file_url,
        )
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def actualizar(
        self, reg: DocumentoModel, cambios: DocumentoUpdate
    ) -> DocumentoModel:
        datos = cambios.dict(exclude_unset=True)
        for campo, valor in datos.items():
            setattr(reg, campo, valor)
        self.db.add(reg)
        self.db.commit()
        self.db.refresh(reg)
        return reg

    def eliminar(self, reg: DocumentoModel) -> None:
        self.db.delete(reg)
        self.db.commit()
