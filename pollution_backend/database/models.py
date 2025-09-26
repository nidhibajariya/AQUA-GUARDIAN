"""
Database models for pollution verification system
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .connection import Base

class VerificationResult(Base):
    """Model for storing verification results"""
    __tablename__ = 'verification_results'
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False, index=True)
    user_image_path = Column(String(500), nullable=False)
    satellite_image_path = Column(String(500), nullable=True)
    user_category = Column(String(50), nullable=False)
    satellite_category = Column(String(50), nullable=True)
    user_confidence = Column(Float, nullable=False)
    satellite_confidence = Column(Float, nullable=True)
    verified = Column(Boolean, nullable=False, default=False)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<VerificationResult(id={self.id}, report_id={self.report_id}, verified={self.verified})>"

class TrainingHistory(Base):
    """Model for storing training history"""
    __tablename__ = 'training_history'
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    dataset_path = Column(String(500), nullable=False)
    epochs = Column(Integer, nullable=False)
    batch_size = Column(Integer, nullable=False)
    validation_split = Column(Float, nullable=False)
    final_accuracy = Column(Float, nullable=False)
    final_loss = Column(Float, nullable=False)
    val_accuracy = Column(Float, nullable=True)
    val_loss = Column(Float, nullable=True)
    training_time_seconds = Column(Float, nullable=True)
    model_path = Column(String(500), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<TrainingHistory(id={self.id}, model_name={self.model_name}, accuracy={self.final_accuracy})>"

class SatelliteImage(Base):
    """Model for storing satellite image metadata"""
    __tablename__ = 'satellite_images'
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    image_path = Column(String(500), nullable=False)
    source = Column(String(50), nullable=False)  # 'google_earth', 'sentinel_hub', 'landsat'
    resolution = Column(String(20), nullable=True)
    cloud_coverage = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<SatelliteImage(id={self.id}, lat={self.latitude}, lng={self.longitude})>"

class ModelVersion(Base):
    """Model for tracking model versions"""
    __tablename__ = 'model_versions'
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(20), nullable=False, unique=True)
    model_path = Column(String(500), nullable=False)
    class_names = Column(Text, nullable=False)  # JSON string of class names
    input_size = Column(String(20), nullable=False)  # "224x224"
    total_params = Column(Integer, nullable=True)
    training_accuracy = Column(Float, nullable=True)
    validation_accuracy = Column(Float, nullable=True)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<ModelVersion(id={self.id}, version={self.version}, active={self.is_active})>"

class APIUsage(Base):
    """Model for tracking API usage statistics"""
    __tablename__ = 'api_usage'
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String(100), nullable=False)
    method = Column(String(10), nullable=False)
    response_time_ms = Column(Float, nullable=True)
    status_code = Column(Integer, nullable=False)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<APIUsage(id={self.id}, endpoint={self.endpoint}, status={self.status_code})>"
