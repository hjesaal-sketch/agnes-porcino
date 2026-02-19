# backend/models/gestacion/Servicios.py

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Session

from pydantic import BaseModel, Field

from backend.database import Base
from backend.models.core.granjas import Granja
from backend.models.gestacion.Madres import Madre
from backend.validators.gestacion_validators import (
    DatosServicioGestacion,
    GestacionValidators,
    GestacionValidationError,
)


# -------------------------------------------------------------------------
# Modelos SQLAlchemy
# -------------------------------------------------------------------------


class ServicioGestacion(Base):
    __tablename__ = "gestation_services"

    id: int = Column(Integer, primary_key=True, index=True)

    empresa_id: int = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id: int = Column(Integer, ForeignKey("granjas.id"), nullable=False)
    sow_id: int = Column(Integer, ForeignKey("sows.id"), nullable=False)

    fecha: date = Column(Date, nullable=False)
    tipo_servicio: str = Column(String(30), nullable=False)
    verraco_id: str = Column(String(50), nullable=False)
    resultado: str = Column(String(20), nullable=False, default="Pendiente")
    observaciones: Optional[str] = Column(Text, nullable=True)

    created_at: datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: datetime = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    granja = relationship("Granja", backref="servicios_gestacion")
    madre = relationship("Madre", backref="servicios_gestacion")

    subservicios = relationship(
        "SubServicioGestacion",
        back_populates="servicio",
        cascade="all, delete-orphan",
    )


class SubServicioGestacion(Base):
    __tablename__ = "gestation_subservices"

    id: int = Column(Integer, primary_key=True, index=True)
    servicio_id: int = Column(
        Integer,
        ForeignKey("gestation_services.id"),
        nullable=False,
    )

    numero: int = Column(Integer, nullable=False)
    fecha: date = Column(Date, nullable=False)
    verraco_id: str = Column(String(50), nullable=False)
    inseminador: str = Column(String(100), nullable=False)

    servicio = relationship("ServicioGestacion", back_populates="subservicios")


# -------------------------------------------------------------------------
# Esquemas Pydantic
# -------------------------------------------------------------------------


class SubServicioBase(BaseModel):
    numero: int
    fecha: date
    verracoId: str
    inseminador: str


class SubServicioCreate(SubServicioBase):
    pass


class SubServicioRead(SubServicioBase):
    id: int

    class Config:
        from_attributes = True


class ServicioBase(BaseModel):
    fecha: date
    identificacionMadre: str = Field(..., max_length=50)
    tipoServicio: str
    verracoId: str
    resultado: str = "Pendiente"
    observaciones: Optional[str] = None
    subServicios: List[SubServicioCreate] = Field(default_factory=list)


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    fecha: Optional[date] = None
    tipoServicio: Optional[str] = None
    verracoId: Optional[str] = None
    resultado: Optional[str] = None
    observaciones: Optional[str] = None
    subServicios: Optional[List[SubServicioCreate]] = None


class ServicioRead(ServicioBase):
    id: int
    empresa_id: int
    granja_id: int
    sow_id: int
    created_at: datetime
    updated_at: datetime
    subServicios: List[SubServicioRead]

    class Config:
        # Se mapea manualmente en el router
        from_attributes = False


# -------------------------------------------------------------------------
# Repositorio de Servicios de Gestación
# -------------------------------------------------------------------------


class ServiciosGestacionRepository:
    """
    Acceso a datos para servicios de gestación.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    # ------------------------------------------------------------------
    # Lectura
    # ------------------------------------------------------------------

    def listar_por_granja(
        self,
        granja_id: int,
        direction: str = "desc",
    ) -> List[ServicioGestacion]:
        """
        Lista servicios de una granja, ordenados por fecha.

        direction:
          - "desc": más nuevos primero
          - "asc": más antiguos primero
        """
        query = (
            self.db.query(ServicioGestacion)
            .filter(ServicioGestacion.granja_id == granja_id)
        )
        if direction == "asc":
            query = query.order_by(ServicioGestacion.fecha.asc())
        else:
            query = query.order_by(ServicioGestacion.fecha.desc())
        return query.all()

    def obtener_por_id(
        self,
        servicio_id: int,
        granja_id: int,
    ) -> Optional[ServicioGestacion]:
        return (
            self.db.query(ServicioGestacion)
            .filter(
                ServicioGestacion.id == servicio_id,
                ServicioGestacion.granja_id == granja_id,
            )
            .first()
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _obtener_o_crear_madre(self, identificacion: str, granja_id: int) -> int:
        """
        Busca la madre por identificación y granja en la tabla sows.
        Si no existe, la crea mínima (identificación, granja) y devuelve su id.
        """
        madre = (
            self.db.query(Madre)
            .filter(
                Madre.identificacion == identificacion,
                Madre.granja_id == granja_id,
            )
            .first()
        )
        if madre is None:
            madre = Madre(identificacion=identificacion, granja_id=granja_id)
            self.db.add(madre)
            self.db.flush()
        return madre.id

    def _crear_o_actualizar_parto_programado(
        self,
        servicio: ServicioGestacion,
    ) -> None:
        """
        Crea o actualiza la programación de parto asociada a este servicio.

        Usa 114 días de gestación estándar desde la fecha de servicio.
        Solo programa si el resultado es Gestante o Pendiente;
        si el resultado es Vacía/Vacia/Vaca, Aborto u otro, desprograma.

        Importante:
        - Si ya existe un PartoProgramado para este servicio, NO recalcula
          la fecha probable; respeta la que se generó al registrar el servicio
          (normalmente en estado Pendiente).
        """
        from backend.models.gestacion.Partos import PartoProgramado

        resultado = (servicio.resultado or "").strip().lower()

        parto = (
            self.db.query(PartoProgramado)
            .filter(PartoProgramado.servicio_id == servicio.id)
            .first()
        )

        # Si la madre quedó en estado no gestante, eliminar programación
        if resultado not in ("gestante", "pendiente"):
            if parto is not None:
                self.db.delete(parto)
            return

        # Si ya existe un parto programado para este servicio,
        # NO tocar fecha_probable: al pasar de Pendiente -> Gestante
        # solo se está confirmando, no reprogramando.
        if parto is not None:
            # Actualizar solo datos informativos, no la fecha probable
            parto.sow_id = servicio.sow_id
            parto.granja_id = servicio.granja_id
            parto.fecha_servicio = servicio.fecha
            parto.tipo_servicio = servicio.tipo_servicio
            parto.observaciones = servicio.observaciones
            return

        # Si no existe aún y el resultado permite programar, crearlo
        fecha_probable = servicio.fecha + timedelta(days=114)

        parto = PartoProgramado(
            sow_id=servicio.sow_id,
            granja_id=servicio.granja_id,
            servicio_id=servicio.id,
            fecha_servicio=servicio.fecha,
            fecha_probable=fecha_probable,
            tipo_servicio=servicio.tipo_servicio,
            observaciones=servicio.observaciones,
            realizado=False,
        )
        self.db.add(parto)

    def _actualizar_estado_madre_desde_servicio(
        self,
        servicio: ServicioGestacion,
    ) -> None:
        """
        Sincroniza Madre.estado_actual según el resultado del servicio.

        - Gestante         -> Gestación
        - Pendiente        -> no cambia estado_actual (se mantiene como estaba)
        - Vacía/Vacia/Vaca -> Vacía
        - Aborto           -> Aborto

        Parida/Lactancia se actualizará desde el módulo de Maternidad.
        """
        madre = (
            self.db.query(Madre)
            .filter(
                Madre.id == servicio.sow_id,
                Madre.granja_id == servicio.granja_id,
            )
            .first()
        )
        if madre is None:
            return

        resultado = (servicio.resultado or "").strip().lower()

        # Solo resultado gestante marca la madre como Gestación
        if resultado == "gestante":
            madre.estado_actual = "Gestación"
        # Pendiente no toca estado_actual, se mantiene el que tenga
        elif resultado in ("vacía", "vacia", "vaca"):
            madre.estado_actual = "Vacía"
        elif resultado == "aborto":
            madre.estado_actual = "Aborto"

        self.db.add(madre)

    # ------------------------------------------------------------------
    # Escritura
    # ------------------------------------------------------------------

    def crear(self, data: ServicioCreate, granja_id: int) -> ServicioGestacion:
        """
        Crear servicio de gestación + subservicios, programar parto y
        actualizar estado de madre.
        """
        granja = self.db.query(Granja).filter(Granja.id == granja_id).first()
        if granja is None:
            raise ValueError("Granja no encontrada para el servicio de gestación.")

        sow_id = self._obtener_o_crear_madre(
            identificacion=data.identificacionMadre,
            granja_id=granja_id,
        )

        # Validación de reglas de negocio
        try:
            GestacionValidators.validar_servicio_gestacion(
                db=self.db,
                datos=DatosServicioGestacion(
                    empresa_id=granja.empresa_id,
                    granja_id=granja_id,
                    verraco_id=data.verracoId,
                    identificacion_madre=data.identificacionMadre,
                    sow_id=sow_id,
                    tipo_servicio=data.tipoServicio,
                    resultado=data.resultado,
                    fecha_servicio=data.fecha,
                ),
            )
        except GestacionValidationError as exc:
            raise ValueError(str(exc))

        servicio = ServicioGestacion(
            empresa_id=granja.empresa_id,
            granja_id=granja_id,
            sow_id=sow_id,
            fecha=data.fecha,
            tipo_servicio=data.tipoServicio,
            verraco_id=data.verracoId,
            resultado=data.resultado,
            observaciones=data.observaciones,
        )
        self.db.add(servicio)
        self.db.flush()

        # Subservicios
        for ss in data.subServicios:
            sub = SubServicioGestacion(
                servicio_id=servicio.id,
                numero=ss.numero,
                fecha=ss.fecha,
                verraco_id=ss.verracoId,
                inseminador=ss.inseminador,
            )
            self.db.add(sub)

        # Programar parto y actualizar estado de madre
        self._crear_o_actualizar_parto_programado(servicio)
        self._actualizar_estado_madre_desde_servicio(servicio)

        self.db.commit()
        self.db.refresh(servicio)
        return servicio

    def actualizar(
        self,
        servicio: ServicioGestacion,
        cambios: ServicioUpdate,
    ) -> ServicioGestacion:
        """
        Actualizar servicio de gestación.
        Borra y recrea subservicios si se envía la lista.
        Revalida si cambia la fecha y sincroniza parto + estado madre.
        """
        datos = cambios.model_dump(exclude_unset=True)

        if "fecha" in datos:
            servicio.fecha = datos["fecha"]
        if "tipoServicio" in datos:
            servicio.tipo_servicio = datos["tipoServicio"]
        if "verracoId" in datos:
            servicio.verraco_id = datos["verracoId"]
        if "resultado" in datos:
            servicio.resultado = datos["resultado"]
        if "observaciones" in datos:
            servicio.observaciones = datos["observaciones"]

        # Subservicios
        if "subServicios" in datos and datos["subServicios"] is not None:
            self.db.query(SubServicioGestacion).filter_by(
                servicio_id=servicio.id
            ).delete()

            for ss in datos["subServicios"]:
                numero = ss.numero if hasattr(ss, "numero") else ss["numero"]
                fecha_ss = ss.fecha if hasattr(ss, "fecha") else ss["fecha"]
                verraco_id = (
                    ss.verracoId if hasattr(ss, "verracoId") else ss["verracoId"]
                )
                inseminador = (
                    ss.inseminador
                    if hasattr(ss, "inseminador")
                    else ss["inseminador"]
                )

                sub = SubServicioGestacion(
                    servicio_id=servicio.id,
                    numero=numero,
                    fecha=fecha_ss,
                    verraco_id=verraco_id,
                    inseminador=inseminador,
                )
                self.db.add(sub)

        self.db.add(servicio)

        # Si cambia la fecha, revalidar
        if "fecha" in datos:
            identificacion_madre: Optional[str] = None
            if servicio.sow_id:
                madre = (
                    self.db.query(Madre)
                    .filter(Madre.id == servicio.sow_id)
                    .first()
                )
                if madre is not None:
                    identificacion_madre = madre.identificacion

            try:
                GestacionValidators.validar_servicio_gestacion(
                    db=self.db,
                    datos=DatosServicioGestacion(
                        empresa_id=servicio.empresa_id,
                        granja_id=servicio.granja_id,
                        verraco_id=servicio.verraco_id,
                        identificacion_madre=identificacion_madre,
                        sow_id=servicio.sow_id,
                        tipo_servicio=servicio.tipo_servicio,
                        resultado=servicio.resultado,
                        fecha_servicio=servicio.fecha,
                    ),
                )
            except GestacionValidationError as exc:
                raise ValueError(str(exc))

        # Actualizar parto programado y estado de madre
        self._crear_o_actualizar_parto_programado(servicio)
        self._actualizar_estado_madre_desde_servicio(servicio)

        self.db.commit()
        self.db.refresh(servicio)
        return servicio

    def eliminar(self, servicio: ServicioGestacion) -> None:
        """
        Eliminar un servicio de gestación.
        Dejas que las FKs se encarguen de subservicios y partos programados.
        """
        self.db.delete(servicio)
        self.db.commit()
