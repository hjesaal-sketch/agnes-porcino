from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de la base de datos desde variable de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///granjas.db")
# Crear el engine de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Crear SessionLocal para manejar sesiones de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependency para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
