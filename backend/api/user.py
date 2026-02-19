from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    role: str
    empresa_id: int

    class Config:
        orm_mode = True
