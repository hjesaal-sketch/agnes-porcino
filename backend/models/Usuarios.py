# backend/models/Usuarios.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from enum import Enum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.database import Base


class RolUsuario(str, Enum):
    OWNER = "Dueño"
    COMPANY_MANAGER = "Gerente General"
    FARM_MANAGER = "Gerente de Granja"
    SYSTEM_OPERATOR = "Operador"
    ECON_MANAGER = "Administrador"
    CONSULTANT = "Consultor"
    VET = "Veterinario"


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nombre = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    rol = Column(String(50), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    ultima_sesion = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: RolUsuario
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    empresa_id: int


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None


class UsuarioRead(UsuarioBase):
    id: int
    empresa_id: int
    ultima_sesion: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_empresa(self, empresa_id: int) -> List[UsuarioModel]:
        return (
            self.db.query(UsuarioModel)
            .filter(UsuarioModel.empresa_id == empresa_id)
            .order_by(UsuarioModel.created_at.desc())
            .all()
        )

    def obtener_por_id(self, id: int) -> Optional[UsuarioModel]:
        return self.db.query(UsuarioModel).filter(UsuarioModel.id == id).first()

    def obtener_por_email(self, email: str) -> Optional[UsuarioModel]:
        return self.db.query(UsuarioModel).filter(UsuarioModel.email == email).first()

    def crear(self, data: UsuarioCreate) -> UsuarioModel:
        from backend.models.user import User
        from backend.utils.security import get_password_hash
        
        # Crear en tabla usuarios
        usuario = UsuarioModel(
            empresa_id=data.empresa_id,
            nombre=data.nombre,
            email=data.email,
            rol=data.rol.value,
            activo=data.activo,
        )
        self.db.add(usuario)
        
        # También crear en tabla users con contraseña temporal
        user_auth = User(
            nombre=data.nombre,
            email=data.email,
            hashed_password=get_password_hash("temporal123"),
            role=data.rol.value,
            empresa_id=data.empresa_id,
        )
        self.db.add(user_auth)
        
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def actualizar(self, id: int, data: UsuarioUpdate) -> Optional[UsuarioModel]:
        usuario = self.obtener_por_id(id)
        if not usuario:
            return None

        if data.nombre is not None:
            usuario.nombre = data.nombre
        if data.rol is not None:
            usuario.rol = data.rol.value
        if data.activo is not None:
            usuario.activo = data.activo

        usuario.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def eliminar(self, id: int) -> bool:
        from backend.models.user import User
        
        usuario = self.obtener_por_id(id)
        if not usuario:
            return False
        
        # Eliminar también de tabla users
        user_auth = self.db.query(User).filter(User.email == usuario.email).first()
        if user_auth:
            self.db.delete(user_auth)
        
        self.db.delete(usuario)
        self.db.commit()
        return True

    def registrar_sesion(self, id: int) -> Optional[UsuarioModel]:
        usuario = self.obtener_por_id(id)
        if not usuario:
            return None
        usuario.ultima_sesion = datetime.utcnow()
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def contar_por_rol(self, empresa_id: int, rol: RolUsuario | str) -> int:
        rol_value = rol.value if isinstance(rol, RolUsuario) else rol
        return (
            self.db.query(UsuarioModel)
            .filter(
                UsuarioModel.empresa_id == empresa_id,
                UsuarioModel.rol == rol_value,
            )
            .count()
        )

    def contar_activos(self, empresa_id: int) -> int:
        return (
            self.db.query(UsuarioModel)
            .filter(
                UsuarioModel.empresa_id == empresa_id,
                UsuarioModel.activo.is_(True),
            )
            .count()
        )
