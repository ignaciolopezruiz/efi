from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlmodel import Session, select

from src.database import get_session
from src.models.proveedor import (
    Proveedor,
    ProveedorCreate,
    ProveedorPublic,
    ProveedorPublicNested,
    ProveedorUpdate,
)

router = APIRouter(
    prefix="/proveedores",
    tags=["Proveedores"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post(
    "/",
    response_model=ProveedorPublic,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "El CUIT ya se encuentra registrado para otro proveedor.",
        }
    },
    summary="Registrar un proveedor",
    description="Registra un nuevo proveedor mayorista o fabricante para la ferretería.",
)
def create_proveedor(proveedor_in: ProveedorCreate, session: SessionDep) -> Proveedor:
    """1. Create: Da de alta un nuevo proveedor validando unicidad de CUIT."""
    existente = session.exec(
        select(Proveedor).where(Proveedor.cuit == proveedor_in.cuit)
    ).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un proveedor registrado con el CUIT {proveedor_in.cuit}",
        )

    proveedor = Proveedor.model_validate(proveedor_in)
    session.add(proveedor)
    session.commit()
    session.refresh(proveedor)
    return proveedor


@router.get(
    "/",
    response_model=Page[ProveedorPublic],
    summary="Listar proveedores paginados",
    description="Devuelve el listado paginado de los proveedores registrados.",
)
def get_proveedores(session: SessionDep):
    """2. Read (All): Obtiene todos los proveedores con paginación integrada."""
    return paginate(session, select(Proveedor))


@router.get(
    "/{proveedor_id}",
    response_model=ProveedorPublicNested,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Proveedor no encontrado en el sistema.",
        }
    },
    summary="Obtener un proveedor por ID",
    description="Busca un proveedor por ID e incluye de manera anidada los productos que suministra.",
)
def get_proveedor(proveedor_id: int, session: SessionDep) -> Proveedor:
    """3. Read (One): Busca un proveedor por ID o levanta error 404."""
    proveedor = session.get(Proveedor, proveedor_id)
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El proveedor con ID {proveedor_id} no fue encontrado",
        )
    return proveedor


@router.patch(
    "/{proveedor_id}",
    response_model=ProveedorPublic,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Proveedor no encontrado para actualizar.",
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "El CUIT modificado ya pertenece a otro proveedor.",
        },
    },
    summary="Actualizar parcialmente un proveedor",
    description="Modifica atributos específicos de un proveedor existente.",
)
def update_proveedor(
    proveedor_id: int,
    proveedor_in: ProveedorUpdate,
    session: SessionDep,
) -> Proveedor:
    """4. Update: Modifica los campos enviados de un proveedor existente."""
    proveedor = session.get(Proveedor, proveedor_id)
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El proveedor con ID {proveedor_id} no fue encontrado para actualizar",
        )

    if proveedor_in.cuit and proveedor_in.cuit != proveedor.cuit:
        duplicado = session.exec(
            select(Proveedor).where(
                Proveedor.cuit == proveedor_in.cuit,
                Proveedor.id != proveedor_id,
            )
        ).first()
        if duplicado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El CUIT {proveedor_in.cuit} ya está en uso por otro proveedor",
            )

    update_data = proveedor_in.model_dump(exclude_unset=True)
    proveedor.sqlmodel_update(update_data)
    session.add(proveedor)
    session.commit()
    session.refresh(proveedor)
    return proveedor


@router.delete(
    "/{proveedor_id}",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Proveedor no encontrado para eliminar.",
        }
    },
    summary="Eliminar un proveedor",
    description="Elimina un proveedor del sistema por su identificador.",
)
def delete_proveedor(proveedor_id: int, session: SessionDep) -> dict[str, object]:
    """5. Delete: Elimina un proveedor o levanta error 404 si no existe."""
    proveedor = session.get(Proveedor, proveedor_id)
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El proveedor con ID {proveedor_id} no fue encontrado para eliminar",
        )

    session.delete(proveedor)
    session.commit()
    return {
        "ok": True,
        "message": f"Proveedor con ID {proveedor_id} eliminado exitosamente",
    }
