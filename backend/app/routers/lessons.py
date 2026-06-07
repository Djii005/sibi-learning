"""Lesson catalog endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Lesson
from app.schemas import LessonDetail, LessonOut

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("", response_model=list[LessonOut])
def list_lessons(db: Session = Depends(get_db)) -> list[LessonOut]:
    rows = db.execute(select(Lesson).order_by(Lesson.order_index)).scalars().all()
    return [LessonOut.model_validate(row) for row in rows]


@router.get("/{slug}", response_model=LessonDetail)
def get_lesson(slug: str, db: Session = Depends(get_db)) -> LessonDetail:
    lesson = db.execute(
        select(Lesson).options(selectinload(Lesson.signs)).where(Lesson.slug == slug)
    ).scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return LessonDetail.model_validate(lesson)
