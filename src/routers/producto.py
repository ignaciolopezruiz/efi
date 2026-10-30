from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlmodel import Session, select

from src.database import get_session
from src.models.categoria import Categoria
from src.models.producto import (
    Producto,
    ProductoCreate,
    ProductoPublic,
    ProductoPublicNested,
    ProductoUpdate,
)
from src.models.proveedor import Proveedor

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post(
    "/",
    response_model=ProductoPublic,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Error en validación de claves foráneas o código de barras duplicado.",
        }
    },
    summary="Registrar un producto",
    description="Crea un nuevo artículo en la ferretería vinculándolo con su categoría y proveedor correspondiente.",
)
def create_producto(producto_in: ProductoCreate, session: SessionDep) -> Producto:
    categoria = session.get(Categoria, producto_in.categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La categoría con ID {producto_in.categoria_id} no existe",
        )

    proveedor = session.get(Proveedor, producto_in.proveedor_id)
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El proveedor con ID {producto_in.proveedor_id} no existe",
        )

    existente = session.exec(
        select(Producto).where(Producto.codigo_barra == producto_in.codigo_barra)
    ).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un producto con el código de barras '{producto_in.codigo_barra}'",
        )

    producto = Producto.model_validate(producto_in)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


@router.get(
    "/",
    response_model=Page[ProductoPublic],
    summary="Listar productos paginados",
    description="Devuelve el catálogo de productos con paginación integrada.",
)
def get_productos(session: SessionDep):
    return paginate(session, select(Producto))


@router.get(
    "/{producto_id}",
    response_model=ProductoPublicNested,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Producto no encontrado en el catálogo.",
        }
    },
    summary="Obtener un producto por ID con datos anidados",
    description="Busca un producto por su ID e incluye de manera anidada los detalles completos de su categoría y proveedor.",
)
def get_producto(producto_id: int, session: SessionDep) -> Producto:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {producto_id} no fue encontrado",
        )
    return producto


@router.patch(
    "/{producto_id}",
    response_model=ProductoPublic,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Producto no encontrado para actualizar.",
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Clave foránea no válida o código de barras duplicado.",
        },
    },
    summary="Actualizar parcialmente un producto",
    description="Actualiza uno o varios atributos de un producto de la ferretería.",
)
def update_producto(
    producto_id: int,
    producto_in: ProductoUpdate,
    session: SessionDep,
) -> Producto:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {producto_id} no fue encontrado para actualizar",
        )

    if producto_in.categoria_id is not None:
        categoria = session.get(Categoria, producto_in.categoria_id)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La categoría con ID {producto_in.categoria_id} no existe",
            )

    if producto_in.proveedor_id is not None:
        proveedor = session.get(Proveedor, producto_in.proveedor_id)
        if not proveedor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El proveedor con ID {producto_in.proveedor_id} no existe",
            )

    if (
        producto_in.codigo_barra is not None
        and producto_in.codigo_barra != producto.codigo_barra
    ):
        existente = session.exec(
            select(Producto).where(
                Producto.codigo_barra == producto_in.codigo_barra,
                Producto.id != producto_id,
            )
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro producto con el código de barras '{producto_in.codigo_barra}'",
            )

    update_data = producto_in.model_dump(exclude_unset=True)
    producto.sqlmodel_update(update_data)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


@router.delete(
    "/{producto_id}",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "Producto no encontrado para eliminar.",
        }
    },
    summary="Eliminar un producto",
    description="Elimina un producto del catálogo por su identificador.",
)
def delete_producto(producto_id: int, session: SessionDep) -> dict[str, object]:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {producto_id} no fue encontrado para eliminar",
        )

    session.delete(producto)
    session.commit()
    return {
        "ok": True,
        "message": f"Producto con ID {producto_id} eliminado exitosamente",
    }
