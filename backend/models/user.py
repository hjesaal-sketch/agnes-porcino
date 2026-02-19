from sqlalchemy import Column, Integer, String, ForeignKey
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, gerente, encargado, veterinario, etc.
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
