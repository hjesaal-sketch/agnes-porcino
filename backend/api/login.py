from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.utils.security import verify_password
from backend.schemas.user import UserOut

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    user: UserOut
    token: str

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos.")

    # Aquí generamos un token JWT (ideal para sesiones seguras)
    token = "FAKE_JWT_TOKEN"  # Reemplaza esto por tu método real de generación JWT

    # Puedes retornar también el rol y empresa asociada aquí
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "empresa_id": user.empresa_id,
            "nombre": user.nombre,
        },
        "token": token
    }
