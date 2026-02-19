from sqlalchemy.orm import Session
from models.gestacion import Gestacion
from schemas.gestacion import GestacionCreate, GestacionUpdate

def get_gestacion(db: Session, gestacion_id: int):
    return db.query(Gestacion).filter(Gestacion.id == gestacion_id).first()

def get_gestaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Gestacion).offset(skip).limit(limit).all()

def create_gestacion(db: Session, gestacion: GestacionCreate):
    db_obj = Gestacion(**gestacion.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_gestacion(db: Session, db_obj: Gestacion, gestacion: GestacionUpdate):
    for field, value in gestacion.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_gestacion(db: Session, db_obj: Gestacion):
    db.delete(db_obj)
    db.commit()
