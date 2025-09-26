"""
Database connection and session management
Supports PostgreSQL, MySQL, and SQLite
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite').lower()
DATABASE_URL = os.getenv('DATABASE_URL')

# Create database URL based on type
if DATABASE_TYPE == 'postgresql':
    if not DATABASE_URL:
        DATABASE_URL = f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'pollution_db')}"
elif DATABASE_TYPE == 'mysql':
    if not DATABASE_URL:
        DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'pollution_db')}"
else:  # SQLite (default)
    DATABASE_URL = DATABASE_URL or "sqlite:///./pollution_verification.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv('DB_ECHO', 'False').lower() == 'true',
    pool_pre_ping=True,
    pool_recycle=300
)

# Create session factory
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Create base class for models
Base = declarative_base()

def get_db_session():
    """Get database session"""
    return SessionLocal()

@contextmanager
def get_db_context():
    """Get database session with context manager"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def init_db():
    """Initialize database tables"""
    try:
        # Import all models to ensure they're registered
        from .models import VerificationResult, TrainingHistory
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def close_db():
    """Close database connections"""
    try:
        SessionLocal.remove()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {str(e)}")

def test_connection():
    """Test database connection"""
    try:
        with get_db_context() as session:
            session.execute("SELECT 1")
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False
