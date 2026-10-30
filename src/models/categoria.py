from typing import TYPE_CHECKING, Annotated, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.producto import Producto, ProductoPublic


class CategoriaBase(SQLModel):
    nombre: Annotated[
        str,
        Field(
            min_length=2,
            max_length=100,
            index=True,
            description="Nombre de la categoría (ej. Herramientas Eléctricas, Pinturería)",
        ),
    ]
    descripcion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=255,
            description="Descripción detallada de la categoría de ferretería",
        ),
    ] = None


class Categoria(CategoriaBase, table=True):
    __tablename__ = "categoria"

    id: Annotated[
        Optional[int],
        Field(
            default=None,
            primary_key=True,
            description="Identificador único autoincremental de la categoría",
        ),
    ] = None

    productos: list["Producto"] = Relationship(
        back_populates="categoria",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(SQLModel):
    nombre: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=2,
            max_length=100,
            description="Nuevo nombre de la categoría",
        ),
    ] = None
    descripcion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=255,
            description="Nueva descripción de la categoría",
        ),
    ] = None


class CategoriaPublic(CategoriaBase):
    id: int


class CategoriaPublicNested(CategoriaPublic):
    productos: list["ProductoPublic"] = []
