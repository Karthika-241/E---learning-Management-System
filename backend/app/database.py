from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./udemy_clone.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema():
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as connection:
        if "email" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
        if "password_hash" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR NOT NULL DEFAULT ''"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
