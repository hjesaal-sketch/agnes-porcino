# backend/api/Usuarios.py
from typing import List, Optional

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.Usuarios import (
    UsuarioRepository,
    UsuarioRead,
    UsuarioCreate,
    UsuarioUpdate,
)

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
)


def get_repo(db: Session = Depends(get_db)) -> UsuarioRepository:
    return UsuarioRepository(db)


@router.get(
    "/",
    response_model=List[UsuarioRead],
    summary="Listar usuarios de la empresa",
)
def listar_usuarios(
    empresa_id: int,
    repo: UsuarioRepository = Depends(get_repo),
):
    return repo.listar_por_empresa(empresa_id)


@router.get(
    "/{id}",
    response_model=UsuarioRead,
    summary="Obtener usuario por ID",
)
def obtener_usuario(
    id: int,
    repo: UsuarioRepository = Depends(get_repo),
):
    usuario = repo.obtener_por_id(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post(
    "/",
    response_model=UsuarioRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo usuario",
)
def crear_usuario(
    payload: UsuarioCreate,
    repo: UsuarioRepository = Depends(get_repo),
):
    existe = repo.obtener_por_email(payload.email)
    if existe:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return repo.crear(payload)


@router.put(
    "/{id}",
    response_model=UsuarioRead,
    summary="Actualizar usuario",
)
def actualizar_usuario(
    id: int,
    payload: UsuarioUpdate,
    repo: UsuarioRepository = Depends(get_repo),
):
    usuario = repo.actualizar(id, payload)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar usuario",
)
def eliminar_usuario(
    id: int,
    repo: UsuarioRepository = Depends(get_repo),
):
    if not repo.eliminar(id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


@router.post(
    "/{id}/sesion",
    response_model=UsuarioRead,
    summary="Registrar sesión del usuario",
)
def registrar_sesion(
    id: int,
    repo: UsuarioRepository = Depends(get_repo),
):
    usuario = repo.registrar_sesion(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
