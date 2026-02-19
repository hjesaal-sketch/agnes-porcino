from backend.database.db import Base, engine, SessionLocal
from backend.models.user import User
from backend.models.empresa import Empresa
from backend.utils.security import get_password_hash

# Crear todas las tablas (si no existen)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 1. Crea una empresa demo si no existe
empresa_nombre = "Empresa Demo"
empresa = db.query(Empresa).filter_by(nombre=empresa_nombre).first()
if not empresa:
    empresa = Empresa(nombre=empresa_nombre)
    db.add(empresa)
    db.commit()
    db.refresh(empresa)

# 2. Crea un usuario admin si no existe
admin_email = "admin@empresa.com"
admin = db.query(User).filter_by(email=admin_email).first()
if not admin:
    admin = User(
        nombre="Admin General",
        email=admin_email,
        hashed_password=get_password_hash("admin123"),
        role="admin",
        empresa_id=empresa.id
    )
    db.add(admin)
    db.commit()
    print(f"Usuario administrador creado: {admin_email} / admin123")
else:
    print(f"Usuario administrador ya existe: {admin_email}")

db.close()
