import sys
from contextlib import asynccontextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from fastapi_pagination.utils import disable_installed_extensions_check

from src.database import create_db_and_tables
from src.routers import categoria_router, producto_router, proveedor_router

disable_installed_extensions_check()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categoria_router)
app.include_router(proveedor_router)
app.include_router(producto_router)

add_pagination(app)


@app.get(
    "/",
    tags=["General"],
    summary="Estado de la API y bienvenida",
    description="Devuelve el estado general del servicio y enlaces a la documentación interactiva.",
)
def root():
    return {
        "sistema": "Ferretería Industrial API",
        "materia": "PP1 - Python (Evaluación Final Integradora)",
        "estado": "En línea",
        "documentacion_swagger": "/docs",
        "documentacion_redoc": "/redoc",
        "modulos": [
            "/categorias",
            "/proveedores",
            "/productos",
        ],
    }
