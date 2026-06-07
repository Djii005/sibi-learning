"""ORM models for the SIBI learning website."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    progress: Mapped[list[Progress]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_dynamic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    signs: Mapped[list[Sign]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Sign.order_index",
    )


class Sign(Base):
    __tablename__ = "signs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(60), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    instructions: Mapped[str] = mapped_column(Text, nullable=False, default="")
    image_alt: Mapped[str] = mapped_column(String(240), nullable=False, default="")
    image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    lesson: Mapped[Lesson] = relationship(back_populates="signs")


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "sign_id", name="uq_progress_user_sign"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    sign_id: Mapped[int] = mapped_column(ForeignKey("signs.id", ondelete="CASCADE"), index=True)
    best_score: Mapped[float] = mapped_column(default=0.0, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="progress")
    sign: Mapped[Sign] = relationship()
