from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models.user import User
from backend.utils.security import verify_password

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(User).filter(User.email == request.email).first()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    
    if not verify_password(request.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol
    }
