rom fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models.Usuarios import Usuario
import bcrypt

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Buscar usuario por email
    usuario = db.query(Usuario).filter(Usuario.email == request.email).first()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    
    # Verificar contraseña
    if not bcrypt.checkpw(request.password.encode('utf-8'), usuario.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    
    # Retornar datos del usuario (sin la contraseña)
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol
    }
