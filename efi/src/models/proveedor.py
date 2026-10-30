from typing import TYPE_CHECKING, Annotated, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.producto import Producto, ProductoPublic


class ProveedorBase(SQLModel):
    """Esquema base para Proveedores con los campos comunes."""
    nombre: Annotated[
        str,
        Field(
            min_length=2,
            max_length=120,
            index=True,
            description="Razón social o nombre comercial del proveedor (ej. Bosch, Sinteplast)",
        ),
    ]
    cuit: Annotated[
        str,
        Field(
            min_length=10,
            max_length=15,
            unique=True,
            index=True,
            description="Número de CUIT o identificación tributaria del proveedor",
        ),
    ]
    email: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=100,
            description="Correo electrónico de contacto comercial",
        ),
    ] = None
    telefono: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=30,
            description="Teléfono de contacto o WhatsApp para pedidos",
        ),
    ] = None
    direccion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=200,
            description="Dirección fiscal o del depósito central",
        ),
    ] = None


class Proveedor(ProveedorBase, table=True):
    """Modelo de la tabla 'proveedor' en la base de datos SQLite."""
    __tablename__ = "proveedor"

    id: Annotated[
        Optional[int],
        Field(
            default=None,
            primary_key=True,
            description="Identificador único del proveedor",
        ),
    ] = None

    # Relación 1 a N con Producto
    productos: list["Producto"] = Relationship(
        back_populates="proveedor",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProveedorCreate(ProveedorBase):
    """Esquema para registrar un nuevo proveedor."""
    pass


class ProveedorUpdate(SQLModel):
    """Esquema para actualización parcial (PATCH) de un proveedor."""
    nombre: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=2,
            max_length=120,
            description="Nuevo nombre o razón social",
        ),
    ] = None
    cuit: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=10,
            max_length=15,
            description="Nuevo CUIT",
        ),
    ] = None
    email: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=100,
            description="Nuevo correo de contacto",
        ),
    ] = None
    telefono: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=30,
            description="Nuevo número telefónico",
        ),
    ] = None
    direccion: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=200,
            description="Nueva dirección",
        ),
    ] = None


class ProveedorPublic(ProveedorBase):
    """Esquema público retornado en respuestas simples."""
    id: int


class ProveedorPublicNested(ProveedorPublic):
    """Esquema anidado que incluye la lista de productos que provee."""
    productos: list["ProductoPublic"] = []
