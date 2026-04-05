from sqlalchemy import Column, Integer, String
from backend.database import Base

class Empresa(Base):
    __tablename__ = "empresas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    # agrega otros campos si lo necesitas
