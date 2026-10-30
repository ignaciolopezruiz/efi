from collections.abc import Generator
from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./ferreteria.db"
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
