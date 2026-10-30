from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlmodel import Session, select

from src.database import get_session
from src.models.categoria import (
    Categoria,
    CategoriaCreate,
    CategoriaPublic,
    CategoriaPublicNested,
    CategoriaUpdate,
)

router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post(
    "/",
    response_model=CategoriaPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una categoría",
    description="Registra una nueva categoría de productos en el catálogo de la ferretería.",
)
def create_categoria(categoria_in: CategoriaCreate, session: SessionDep) -> Categoria:
    """1. Create: Da de alta una nueva categoría validando su esquema de entrada."""
    categoria = Categoria.model_validate(categoria_in)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


@router.get(
    "/",
    response_model=Page[CategoriaPublic],
    summary="Listar categorías paginadas",
    description="Devuelve el listado paginado de todas las categorías disponibles en el sistema.",
)
def get_categorias(session: SessionDep):
    """2. Read (All): Obtiene todas las categorías con paginación integrada."""
    return paginate(session, select(Categoria))


@router.get(
    "/{categoria_id}",
    response_model=CategoriaPublicNested,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Categoría no encontrada en el sistema.",
        }
    },
    summary="Obtener una categoría por ID",
    description="Busca una categoría específica e incluye de manera anidada (Nested) la lista de productos asociados.",
)
def get_categoria(categoria_id: int, session: SessionDep) -> Categoria:
    """3. Read (One): Busca una categoría por ID o levanta error 404."""
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La categoría con ID {categoria_id} no fue encontrada",
        )
    return categoria


@router.patch(
    "/{categoria_id}",
    response_model=CategoriaPublic,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Categoría no encontrada para actualizar.",
        }
    },
    summary="Actualizar parcialmente una categoría",
    description="Modifica uno o varios atributos de una categoría existente.",
)
def update_categoria(
    categoria_id: int,
    categoria_in: CategoriaUpdate,
    session: SessionDep,
) -> Categoria:
    """4. Update: Modifica los campos enviados de una categoría existente."""
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La categoría con ID {categoria_id} no fue encontrada para actualizar",
        )

    update_data = categoria_in.model_dump(exclude_unset=True)
    categoria.sqlmodel_update(update_data)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


@router.delete(
    "/{categoria_id}",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Categoría no encontrada para eliminar.",
        }
    },
    summary="Eliminar una categoría",
    description="Elimina una categoría del sistema por su identificador.",
)
def delete_categoria(categoria_id: int, session: SessionDep) -> dict[str, object]:
    """5. Delete: Elimina una categoría o levanta error 404 si no existe."""
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La categoría con ID {categoria_id} no fue encontrada para eliminar",
        )

    session.delete(categoria)
    session.commit()
    return {
        "ok": True,
        "message": f"Categoría con ID {categoria_id} eliminada exitosamente",
    }
