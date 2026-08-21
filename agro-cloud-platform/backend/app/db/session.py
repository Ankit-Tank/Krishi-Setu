import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agro_cloud.db")

# Fallback mechanism if PostgreSQL connection fails or if sqlite is specified
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    print(f"Warning: Could not connect to {DATABASE_URL}. Falling back to SQLite local database.")
    DATABASE_URL = "sqlite:///./agro_cloud.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
