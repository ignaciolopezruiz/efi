from typing import TYPE_CHECKING, Annotated, Optional
from sqlmodel import Field, Relationship, SQLModel

from src.models.categoria import Categoria, CategoriaPublic
from src.models.proveedor import Proveedor, ProveedorPublic


class ProductoBase(SQLModel):
    nombre: Annotated[
        str,
        Field(
            min_length=2,
            max_length=150,
            index=True,
            description="Nombre o denominación del producto (ej. Taladro Percutor 750W)",
        ),
    ]
    codigo_barra: Annotated[
        str,
        Field(
            min_length=3,
            max_length=50,
            unique=True,
            index=True,
            description="Código de barras o SKU único del artículo",
        ),
    ]
    descripcion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=300,
            description="Descripción técnica y detalles del producto",
        ),
    ] = None
    precio: Annotated[
        float,
        Field(
            gt=0,
            description="Precio unitario de venta al público",
        ),
    ]
    stock: Annotated[
        int,
        Field(
            ge=0,
            default=0,
            description="Cantidad actual en depósito o mostrador",
        ),
    ] = 0
    stock_minimo: Annotated[
        int,
        Field(
            ge=0,
            default=5,
            description="Punto de reorden o stock mínimo deseado",
        ),
    ] = 5

    categoria_id: Annotated[
        int,
        Field(
            foreign_key="categoria.id",
            description="ID de la categoría asociada",
        ),
    ]
    proveedor_id: Annotated[
        int,
        Field(
            foreign_key="proveedor.id",
            description="ID del proveedor asociado",
        ),
    ]


class Producto(ProductoBase, table=True):
    __tablename__ = "producto"

    id: Annotated[
        Optional[int],
        Field(
            default=None,
            primary_key=True,
            description="Identificador único del producto",
        ),
    ] = None

    categoria: Optional[Categoria] = Relationship(back_populates="productos")
    proveedor: Optional[Proveedor] = Relationship(back_populates="productos")


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(SQLModel):
    nombre: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=2,
            max_length=150,
            description="Nuevo nombre del producto",
        ),
    ] = None
    codigo_barra: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=3,
            max_length=50,
            description="Nuevo código de barras",
        ),
    ] = None
    descripcion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=300,
            description="Nueva descripción técnica",
        ),
    ] = None
    precio: Annotated[
        Optional[float],
        Field(
            default=None,
            gt=0,
            description="Nuevo precio unitario",
        ),
    ] = None
    stock: Annotated[
        Optional[int],
        Field(
            default=None,
            ge=0,
            description="Nuevo stock disponible",
        ),
    ] = None
    stock_minimo: Annotated[
        Optional[int],
        Field(
            default=None,
            ge=0,
            description="Nuevo stock mínimo",
        ),
    ] = None
    categoria_id: Annotated[
        Optional[int],
        Field(
            default=None,
            foreign_key="categoria.id",
            description="Nuevo ID de categoría",
        ),
    ] = None
    proveedor_id: Annotated[
        Optional[int],
        Field(
            default=None,
            foreign_key="proveedor.id",
            description="Nuevo ID de proveedor",
        ),
    ] = None


class ProductoPublic(ProductoBase):
    id: int


class ProductoPublicNested(ProductoPublic):
    categoria: Optional[CategoriaPublic] = None
    proveedor: Optional[ProveedorPublic] = None
