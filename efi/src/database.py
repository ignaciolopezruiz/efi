from collections.abc import Generator
from sqlmodel import Session, SQLModel, create_engine

# URL de conexión a la base de datos SQLite local
DATABASE_URL = "sqlite:///./ferreteria.db"

# connect_args={"check_same_thread": False} es necesario para SQLite en entornos multihilo como FastAPI
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session() -> Generator[Session, None, None]:
    """
    Dependencia de FastAPI para obtener una sesión de base de datos SQLModel por request.
    Garantiza el cierre adecuado de la sesión luego de finalizar la operación.
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    """
    Crea las tablas en la base de datos si no existen.
    Útil para inicializaciones directas o pruebas.
    """
    SQLModel.metadata.create_all(engine)
