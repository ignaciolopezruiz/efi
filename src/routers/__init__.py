from src.routers.categoria import router as categoria_router
from src.routers.producto import router as producto_router
from src.routers.proveedor import router as proveedor_router

__all__ = [
    "categoria_router",
    "proveedor_router",
    "producto_router",
]
