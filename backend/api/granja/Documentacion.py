# backend/api/granja/Documentacion.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.granja.Documentacion import (
    DocumentoRepository,
    DocumentoRead,
    DocumentoCreate,
    DocumentoUpdate,
)

router = APIRouter(
    prefix="/granja/documentos",
    tags=["Granja - Documentación"],
)


def get_repo(db: Session = Depends(get_db)) -> DocumentoRepository:
    return DocumentoRepository(db)


@router.get(
    "/",
    response_model=List[DocumentoRead],
    summary="Listar documentos de la granja",
)
def listar_documentos(
    empresa_id: int,
    granja_id: int,
    repo: DocumentoRepository = Depends(get_repo),
):
    return repo.listar_por_granja(empresa_id=empresa_id, granja_id=granja_id)


@router.post(
    "/",
    response_model=DocumentoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear documento",
)
def crear_documento(
    payload: DocumentoCreate,
    repo: DocumentoRepository = Depends(get_repo),
):
    return repo.crear(payload)


@router.put(
    "/{doc_id}",
    response_model=DocumentoRead,
    summary="Actualizar documento",
)
def actualizar_documento(
    doc_id: int,
    empresa_id: int,
    granja_id: int,
    cambios: DocumentoUpdate,
    repo: DocumentoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(doc_id=doc_id, empresa_id=empresa_id, granja_id=granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado",
        )
    return repo.actualizar(reg, cambios)


@router.delete(
    "/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar documento",
)
def eliminar_documento(
    doc_id: int,
    empresa_id: int,
    granja_id: int,
    repo: DocumentoRepository = Depends(get_repo),
):
    reg = repo.obtener_por_id(doc_id=doc_id, empresa_id=empresa_id, granja_id=granja_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado",
        )
    repo.eliminar(reg)
