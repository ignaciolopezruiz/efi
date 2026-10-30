from src.models.categoria import (
    Categoria,
    CategoriaBase,
    CategoriaCreate,
    CategoriaPublic,
    CategoriaPublicNested,
    CategoriaUpdate,
)
from src.models.producto import (
    Producto,
    ProductoBase,
    ProductoCreate,
    ProductoPublic,
    ProductoPublicNested,
    ProductoUpdate,
)
from src.models.proveedor import (
    Proveedor,
    ProveedorBase,
    ProveedorCreate,
    ProveedorPublic,
    ProveedorPublicNested,
    ProveedorUpdate,
)

CategoriaPublicNested.model_rebuild()
ProveedorPublicNested.model_rebuild()
ProductoPublicNested.model_rebuild()

__all__ = [
    "CategoriaBase",
    "Categoria",
    "CategoriaCreate",
    "CategoriaUpdate",
    "CategoriaPublic",
    "CategoriaPublicNested",
    "ProveedorBase",
    "Proveedor",
    "ProveedorCreate",
    "ProveedorUpdate",
    "ProveedorPublic",
    "ProveedorPublicNested",
    "ProductoBase",
    "Producto",
    "ProductoCreate",
    "ProductoUpdate",
    "ProductoPublic",
    "ProductoPublicNested",
]
