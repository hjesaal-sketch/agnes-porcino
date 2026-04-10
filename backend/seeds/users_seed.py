# backend/seeds/users_seed.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.models.Usuarios import UsuarioModel, RolUsuario
from backend.models.user import User
from backend.utils.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

def seed_users(db: Session):
    """
    Crea usuarios de demostración si no existen.
    """
    try:
        logger.info("🌱 Iniciando seed de usuarios demo...")
        
        # Verificar si ya existen usuarios
        existing_user = db.query(User).filter(User.email == "dueno@agnes.com").first()
        if existing_user:
            logger.info("✅ Los usuarios demo ya existen. Omitiendo seed.")
            return
        
        # USAR SIEMPRE EMPRESA_ID = 1 para que coincida con el frontend
        empresa_id = 1
        
        # Verificar que existe la empresa con ID 1
        result = db.execute(text("SELECT id FROM empresas WHERE id = 1")).fetchone()
        if not result:
            # Crear empresa con ID 1
            db.execute(text(
                "INSERT INTO empresas (id, nombre, created_at, updated_at) "
                "VALUES (1, 'Empresa Demo AGNES', datetime('now'), datetime('now'))"
            ))
            db.commit()
            logger.info(f"✅ Empresa demo creada con ID: 1")
        
        demo_users = [
            {
                "nombre": "Usuario Dueño",
                "email": "dueno@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.OWNER,
            },
            {
                "nombre": "Usuario Gerente General",
                "email": "gerente@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.COMPANY_MANAGER,
            },
            {
                "nombre": "Usuario Gerente Granja",
                "email": "granja@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.FARM_MANAGER,
            },
            {
                "nombre": "Usuario Operador",
                "email": "operador@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.SYSTEM_OPERATOR,
            },
            {
                "nombre": "Usuario Administrador",
                "email": "admin@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.ECON_MANAGER,
            },
            {
                "nombre": "Usuario Consultor",
                "email": "consultor@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.CONSULTANT,
            },
            {
                "nombre": "Usuario Veterinario",
                "email": "veterinario@agnes.com",
                "password": "agnes2024",
                "rol": RolUsuario.VET,
            }
        ]
        
        for user_data in demo_users:
            # Crear en tabla usuarios
            usuario = UsuarioModel(
                empresa_id=empresa_id,
                nombre=user_data["nombre"],
                email=user_data["email"],
                rol=user_data["rol"].value,
                activo=True,
            )
            db.add(usuario)
            
            # Crear en tabla users (para autenticación)
            user_auth = User(
                nombre=user_data["nombre"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["rol"].value,
                empresa_id=empresa_id,
            )
            db.add(user_auth)
            
            logger.info(f"✅ Usuario creado: {user_data['email']} con rol {user_data['rol'].value}")
        
        db.commit()
        logger.info("🎉 Seed de usuarios completado exitosamente. 7 usuarios creados con empresa_id=1")
        
    except Exception as e:
        logger.error(f"❌ Error al crear usuarios de demostración: {str(e)}")
        db.rollback()
        raise
