import sys
from pathlib import Path

# Asegurar que la raíz del proyecto esté en sys.path para soportar 'fastapi dev src/main.py' y 'uvicorn'
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from fastapi_pagination.utils import disable_installed_extensions_check

from src.database import create_db_and_tables
from src.routers import categoria_router, producto_router, proveedor_router
from contextlib import asynccontextmanager
from pathlib import Path

from alembic.config import Config
from alembic import command
BASE_DIR = Path(__file__).resolve().parent.parent


def run_migrations():
    ini_path = BASE_DIR / "alembic.ini"
    alembic_dir = BASE_DIR / "alembic"

    # Verificación rápida en los logs para confirmar que se subieron los archivos
    if not ini_path.exists():
        raise FileNotFoundError(f"No se encontró alembic.ini en: {ini_path}")

    alembic_cfg = Config(str(ini_path))

    # Forzamos la ruta absoluta de la carpeta de migraciones
    alembic_cfg.set_main_option("script_location", str(alembic_dir))

    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    yield
# Desactivar advertencia informativa de extensiones de fastapi_pagination
disable_installed_extensions_check()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestor de ciclo de vida de la aplicación.
    Inicializa tablas si aún no existen al iniciar la API.
    """
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Configuración de CORS para permitir la conexión fluida con el frontend de JavaScript
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen (ideal para desarrollo e integración con JS)
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, PATCH, DELETE, OPTIONS, etc.
    allow_headers=["*"],
)

# Registro de routers modulares
app.include_router(categoria_router)
app.include_router(proveedor_router)
app.include_router(producto_router)

# Configuración de paginación en la app
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
