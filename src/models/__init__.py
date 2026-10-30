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

# Reconstruir esquemas con referencias hacia adelante / anidadas
CategoriaPublicNested.model_rebuild()
ProveedorPublicNested.model_rebuild()
ProductoPublicNested.model_rebuild()

__all__ = [
    # Categoria
    "CategoriaBase",
    "Categoria",
    "CategoriaCreate",
    "CategoriaUpdate",
    "CategoriaPublic",
    "CategoriaPublicNested",
    # Proveedor
    "ProveedorBase",
    "Proveedor",
    "ProveedorCreate",
    "ProveedorUpdate",
    "ProveedorPublic",
    "ProveedorPublicNested",
    # Producto
    "ProductoBase",
    "Producto",
    "ProductoCreate",
    "ProductoUpdate",
    "ProductoPublic",
    "ProductoPublicNested",
]
