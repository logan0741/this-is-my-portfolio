"""
SQLAlchemy ORM Models
프론트엔드 JSON 스키마와 완벽 호환
"""
import uuid
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Enum,
    ForeignKey, DateTime, func
)
from sqlalchemy.orm import relationship
from database import Base


class Year(Base):
    __tablename__ = "years"

    id = Column(Integer, primary_key=True, autoincrement=True)
    year_value = Column(Integer, unique=True, nullable=False)

    activities = relationship("Activity", back_populates="year", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    year_id = Column(Integer, ForeignKey("years.id", ondelete="CASCADE"), nullable=False)
    term = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    is_awarded = Column(Boolean, default=False)
    award_title = Column(String(200), nullable=True)
    github_url = Column(String(500), nullable=True)
    readme_content = Column(Text, nullable=True)
    reflection = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    year = relationship("Year", back_populates="activities")
    roles = relationship("ActivityRole", back_populates="activity", cascade="all, delete-orphan")
    files = relationship("ActivityFile", back_populates="activity", cascade="all, delete-orphan")


class ActivityRole(Base):
    __tablename__ = "activity_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(100), nullable=False)

    activity = relationship("Activity", back_populates="roles")


class ActivityFile(Base):
    __tablename__ = "activity_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    file_type = Column(Enum("image", "certificate"), nullable=False)
    file_url = Column(String(500), nullable=False)

    activity = relationship("Activity", back_populates="files")
