# backend/models/Dashboard.py
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional, List
from enum import Enum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import Base


class DashboardIndicador(Base):
    __tablename__ = "dashboard_indicadores"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    proximos_partos = Column(Integer, nullable=False, default=0)
    fallos_reproductivos = Column(Integer, nullable=False, default=0)
    mortalidad = Column(Integer, nullable=False, default=0)
    alimento_bajo = Column(Integer, nullable=False, default=0)
    medicamento_bajo = Column(Integer, nullable=False, default=0)
    celos_recientes = Column(Integer, nullable=False, default=0)
    listos_destete = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class DashboardEventoTarea(Base):
    __tablename__ = "dashboard_eventos_tareas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    tipo = Column(String(50), nullable=False)
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False)
    fecha_evento = Column(DateTime, nullable=False)
    completado = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class DashboardResumenReproductivo(Base):
    __tablename__ = "dashboard_resumen_reproductivo"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    granja_id = Column(Integer, ForeignKey("granjas.id"), nullable=False)

    mes = Column(String(20), nullable=False)
    partos = Column(Integer, nullable=False)
    fallos = Column(Integer, nullable=False)
    mortalidad = Column(Integer, nullable=False)
    destetes = Column(Integer, nullable=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# SCHEMAS PYDANTIC

class IndicadorBase(BaseModel):
    proximos_partos: int
    fallos_reproductivos: int
    mortalidad: int
    alimento_bajo: int
    medicamento_bajo: int
    celos_recientes: int
    listos_destete: int


class IndicadorCreate(IndicadorBase):
    empresa_id: int
    granja_id: int


class IndicadorRead(IndicadorBase):
    id: int
    empresa_id: int
    granja_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventoTareaBase(BaseModel):
    tipo: str
    descripcion: str
    cantidad: int
    fecha_evento: datetime
    completado: bool = False


class EventoTareaCreate(EventoTareaBase):
    empresa_id: int
    granja_id: int


class EventoTareaRead(EventoTareaBase):
    id: int
    empresa_id: int
    granja_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumenReproductivoBase(BaseModel):
    mes: str
    partos: int
    fallos: int
    mortalidad: int
    destetes: int


class ResumenReproductivoCreate(ResumenReproductivoBase):
    empresa_id: int
    granja_id: int


class ResumenReproductivoRead(ResumenReproductivoBase):
    id: int
    empresa_id: int
    granja_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def obtener_indicadores(
        self, empresa_id: int, granja_id: int
    ) -> Optional[DashboardIndicador]:
        from backend.models.gestacion.Madres import Madre
        from backend.models.gestacion.Servicios import ServicioGestacion as GestacionServicio
        from backend.models.maternidad.Ingreso import IngresoMaternidad as MaternidadIngreso
        from backend.models.insumos.Alimentos import AlimentoModel
        from backend.models.insumos.Medicamentos import MedicamentoModel

        # 1. Próximos partos
        fecha_limite = datetime.now().date() + timedelta(days=30)
        proximos_partos = self.db.query(Madre).filter(
            Madre.granja_id == granja_id,
            Madre.estado_actual == 'Gestación',
            Madre.fecha_probable_parto <= fecha_limite
        ).count()

        # 2. Fallos reproductivos
        fecha_limite = datetime.now().date() - timedelta(days=30)
        fallos_reproductivos = self.db.query(GestacionServicio).filter(
            GestacionServicio.granja_id == granja_id,
            GestacionServicio.resultado == 'Fallido',
            GestacionServicio.fecha >= fecha_limite
        ).count()

        # 3. Mortalidad
        fecha_limite = datetime.now().date() - timedelta(days=30)
        mortalidad = self.db.query(MaternidadIngreso).filter(
            MaternidadIngreso.granja_id == granja_id,
            MaternidadIngreso.estado == 'Muerto',
            MaternidadIngreso.fecha >= fecha_limite
        ).count()

        # 4. Alimentos con stock bajo
        alimento_bajo = self.db.query(AlimentoModel).filter(
            AlimentoModel.granja_id == granja_id,
            AlimentoModel.stock < 10.0
        ).count()

        # 5. Medicamentos con stock bajo
        medicamento_bajo = self.db.query(MedicamentoModel).filter(
            MedicamentoModel.granja_id == granja_id,
            MedicamentoModel.stock < 10.0
        ).count()

        # 6. Celos recientes
        fecha_limite = datetime.now().date() - timedelta(days=7)
        celos_recientes = self.db.query(GestacionServicio).filter(
            GestacionServicio.granja_id == granja_id,
            GestacionServicio.resultado == 'Celo',
            GestacionServicio.fecha >= fecha_limite
        ).count()

        # 7. Listos para destete
        listos_destete = self.db.query(MaternidadIngreso).filter(
            MaternidadIngreso.granja_id == granja_id,
            MaternidadIngreso.edad_dias >= 21,
            MaternidadIngreso.estado == 'Activo'
        ).count()

        indicador = self.db.query(DashboardIndicador).filter(
            DashboardIndicador.empresa_id == empresa_id,
            DashboardIndicador.granja_id == granja_id
        ).first()

        if indicador:
            indicador.proximos_partos = proximos_partos
            indicador.fallos_reproductivos = fallos_reproductivos
            indicador.mortalidad = mortalidad
            indicador.alimento_bajo = alimento_bajo
            indicador.medicamento_bajo = medicamento_bajo
            indicador.celos_recientes = celos_recientes
            indicador.listos_destete = listos_destete
            indicador.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(indicador)
        else:
            indicador = DashboardIndicador(
                empresa_id=empresa_id,
                granja_id=granja_id,
                proximos_partos=proximos_partos,
                fallos_reproductivos=fallos_reproductivos,
                mortalidad=mortalidad,
                alimento_bajo=alimento_bajo,
                medicamento_bajo=medicamento_bajo,
                celos_recientes=celos_recientes,
                listos_destete=listos_destete,
            )
            self.db.add(indicador)
            self.db.commit()
            self.db.refresh(indicador)

        return indicador

    def crear_actualizar_indicadores(
        self, data: IndicadorCreate
    ) -> DashboardIndicador:
        return self.obtener_indicadores(data.empresa_id, data.granja_id)

    def listar_eventos_tareas(
        self, empresa_id: int, granja_id: int, completado: bool = False
    ) -> List[DashboardEventoTarea]:
        return (
            self.db.query(DashboardEventoTarea)
            .filter(
                DashboardEventoTarea.empresa_id == empresa_id,
                DashboardEventoTarea.granja_id == granja_id,
                DashboardEventoTarea.completado == completado,
            )
            .order_by(DashboardEventoTarea.fecha_evento)
            .all()
        )

    def crear_evento_tarea(self, data: EventoTareaCreate) -> DashboardEventoTarea:
        evento = DashboardEventoTarea(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            tipo=data.tipo,
            descripcion=data.descripcion,
            cantidad=data.cantidad,
            fecha_evento=data.fecha_evento,
            completado=data.completado,
        )
        self.db.add(evento)
        self.db.commit()
        self.db.refresh(evento)
        return evento

    def marcar_evento_completado(self, id: int) -> DashboardEventoTarea:
        evento = self.db.query(DashboardEventoTarea).filter(
            DashboardEventoTarea.id == id
        ).first()
        if evento:
            evento.completado = True
            evento.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(evento)
        return evento

    def listar_resumen_reproductivo(
        self, empresa_id: int, granja_id: int
    ) -> List[DashboardResumenReproductivo]:
        return (
            self.db.query(DashboardResumenReproductivo)
            .filter(
                DashboardResumenReproductivo.empresa_id == empresa_id,
                DashboardResumenReproductivo.granja_id == granja_id,
            )
            .order_by(DashboardResumenReproductivo.mes)
            .all()
        )

    def crear_resumen_reproductivo(
        self, data: ResumenReproductivoCreate
    ) -> DashboardResumenReproductivo:
        resumen = DashboardResumenReproductivo(
            empresa_id=data.empresa_id,
            granja_id=data.granja_id,
            mes=data.mes,
            partos=data.partos,
            fallos=data.fallos,
            mortalidad=data.mortalidad,
            destetes=data.destetes,
        )
        self.db.add(resumen)
        self.db.commit()
        self.db.refresh(resumen)
        return resumen