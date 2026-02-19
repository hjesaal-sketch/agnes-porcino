# backend/models/maternidad/Partos.py
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Session

from backend.database import Base
from pydantic import BaseModel, Field

from backend.validators.maternidad_validators import (
    DatosPartoMaternidad,
    MaternidadValidators,
    MaternidadValidationError,
)


# =============== SQLAlchemy ===============


class PartoMaternidad(Base):
    __tablename__ = "maternity_farrowings"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    # FK opcional al parto programado en gestación
    parto_programado_id = Column(
        Integer,
        ForeignKey("scheduled_farrowings.id"),
        nullable=True,
    )

    fecha_parto = Column(Date, nullable=False)
    identificacion_madre = Column(String(50), nullable=False)
    nacidos_vivos = Column(Integer, nullable=False)
    nacidos_muertos = Column(Integer, nullable=False)
    lechones_viables = Column(Integer, nullable=False)
    peso_total = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Aliases camelCase para que PartoRead pueda mapear desde atributos del modelo
    @property
    def fechaParto(self) -> date:
        return self.fecha_parto

    @property
    def identificacionMadre(self) -> str:
        return self.identificacion_madre

    @property
    def nacidosVivos(self) -> int:
        return self.nacidos_vivos

    @property
    def nacidosMuertos(self) -> int:
        return self.nacidos_muertos

    @property
    def lechonesViables(self) -> int:
        return self.lechones_viables

    @property
    def pesoTotal(self) -> float:
        return self.peso_total


# =============== Pydantic ===============


class PartoBase(BaseModel):
    empresa_id: int
    granja_id: int

    fechaParto: date
    identificacionMadre: str = Field(..., max_length=50)
    nacidosVivos: int
    nacidosMuertos: int
    lechonesViables: int
    pesoTotal: float
    responsable: str
    observaciones: Optional[str] = None
    # vínculo opcional al parto programado de gestación
    parto_programado_id: Optional[int] = None


class PartoCreate(PartoBase):
    pass


class PartoUpdate(BaseModel):
    fechaParto: Optional[date] = None
    identificacionMadre: Optional[str] = Field(None, max_length=50)
    nacidosVivos: Optional[int] = None
    nacidosMuertos: Optional[int] = None
    lechonesViables: Optional[int] = None
    pesoTotal: Optional[float] = None
    responsable: Optional[str] = None
    observaciones: Optional[str] = None
    parto_programado_id: Optional[int] = None


class PartoRead(PartoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============== Repositorio ===============


class PartoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_granja(
        self,
        empresa_id: int,
        granja_id: int,
    ) -> List[PartoMaternidad]:
        return (
            self.db.query(PartoMaternidad)
            .filter(
                PartoMaternidad.empresa_id == empresa_id,
                PartoMaternidad.granja_id == granja_id,
            )
            .order_by(PartoMaternidad.fecha_parto.desc())
            .all()
        )

    def obtener_por_id(
        self,
        parto_id: int,
        empresa_id: int,
        granja_id: int,
    ) -> Optional[PartoMaternidad]:
        return (
            self.db.query(PartoMaternidad)
            .filter(
                PartoMaternidad.id == parto_id,
                PartoMaternidad.empresa_id == empresa_id,
                PartoMaternidad.granja_id == granja_id,
            )
            .first()
        )

    def crear(self, data: PartoCreate) -> PartoMaternidad:
        # Validar reglas de maternidad (incluye madre, fechas, orden servicio<parto y parto_programado)
        try:
            MaternidadValidators.validar_parto(
                db=self.db,
                datos=DatosPartoMaternidad(
                    empresa_id=data.empresa_id,
                    granja_id=data.granja_id,
                    fecha_parto=data.fechaParto,
                    identificacion_madre=data.identificacionMadre,
                    nacidos_vivos=data.nacidosVivos,
                    nacidos_muertos=data.nacidosMuertos,
                    lechones_viables=data.lechonesViables,
                    peso_total=data.pesoTotal,
                    parto_programado_id=data.parto_programado_id,
                ),
            )
        except MaternidadValidationError as exc:
            raise MaternidadValidationError(str(exc))

        parto = PartoMaternidad(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            fecha_parto=data.fechaParto,
            identificacion_madre=data.identificacionMadre,
            nacidos_vivos=data.nacidosVivos,
            nacidos_muertos=data.nacidosMuertos,
            lechones_viables=data.lechonesViables,
            peso_total=data.pesoTotal,
            responsable=data.responsable,
            observaciones=data.observaciones,
            parto_programado_id=data.parto_programado_id,
        )
        self.db.add(parto)
        self.db.commit()
        self.db.refresh(parto)
        return parto

    def actualizar(
        self,
        parto: PartoMaternidad,
        cambios: PartoUpdate,
    ) -> PartoMaternidad:
        datos = cambios.dict(exclude_unset=True)

        # Si cambia algo crítico, revalidar
        if any(
            campo in datos
            for campo in (
                "fechaParto",
                "identificacionMadre",
                "nacidosVivos",
                "nacidosMuertos",
                "lechonesViables",
                "pesoTotal",
                "parto_programado_id",
            )
        ):
            dto = DatosPartoMaternidad(
                empresa_id=parto.empresa_id,
                granja_id=parto.granja_id,
                fecha_parto=datos.get("fechaParto", parto.fecha_parto),
                identificacion_madre=datos.get(
                    "identificacionMadre",
                    parto.identificacion_madre,
                ),
                nacidos_vivos=datos.get("nacidosVivos", parto.nacidos_vivos),
                nacidos_muertos=datos.get("nacidosMuertos", parto.nacidos_muertos),
                lechones_viables=datos.get(
                    "lechonesViables",
                    parto.lechones_viables,
                ),
                peso_total=datos.get("pesoTotal", parto.peso_total),
                parto_programado_id=datos.get(
                    "parto_programado_id",
                    parto.parto_programado_id,
                ),
            )
            try:
                MaternidadValidators.validar_parto(db=self.db, datos=dto)
            except MaternidadValidationError as exc:
                raise MaternidadValidationError(str(exc))

        # Aplicar cambios
        for campo, valor in datos.items():
            if campo == "fechaParto":
                setattr(parto, "fecha_parto", valor)
            elif campo == "identificacionMadre":
                setattr(parto, "identificacion_madre", valor)
            elif campo == "nacidosVivos":
                setattr(parto, "nacidos_vivos", valor)
            elif campo == "nacidosMuertos":
                setattr(parto, "nacidos_muertos", valor)
            elif campo == "lechonesViables":
                setattr(parto, "lechones_viables", valor)
            elif campo == "pesoTotal":
                setattr(parto, "peso_total", valor)
            else:
                setattr(parto, campo, valor)

        self.db.add(parto)
        self.db.commit()
        self.db.refresh(parto)
        return parto

    def eliminar(self, parto: PartoMaternidad) -> None:
        self.db.delete(parto)
        self.db.commit()
