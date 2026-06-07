"""User progress endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Progress, Sign, User
from app.schemas import ProgressIn, ProgressOut, ProgressSummary
from app.security import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.post("", response_model=ProgressOut)
def record_attempt(
    payload: ProgressIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProgressOut:
    sign = db.get(Sign, payload.sign_id)
    if sign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sign not found")

    row = db.execute(
        select(Progress).where(
            Progress.user_id == current_user.id, Progress.sign_id == payload.sign_id
        )
    ).scalar_one_or_none()
    if row is None:
        row = Progress(
            user_id=current_user.id,
            sign_id=payload.sign_id,
            best_score=0.0,
            attempts=0,
            correct=0,
        )
        db.add(row)

    row.attempts = (row.attempts or 0) + 1
    if payload.correct:
        row.correct = (row.correct or 0) + 1
    if payload.score > (row.best_score or 0.0):
        row.best_score = payload.score

    db.commit()
    db.refresh(row)
    return ProgressOut.model_validate(row)


@router.get("/summary", response_model=ProgressSummary)
def progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProgressSummary:
    rows: list[Progress] = list(
        db.execute(select(Progress).where(Progress.user_id == current_user.id))
        .scalars()
        .all()
    )
    total_signs = db.execute(select(Sign.id)).all()
    mastered = sum(1 for row in rows if row.best_score >= 0.8)
    attempts = sum(row.attempts for row in rows)
    avg = (sum(row.best_score for row in rows) / len(rows)) if rows else 0.0

    return ProgressSummary(
        total_signs=len(total_signs),
        mastered_signs=mastered,
        attempts=attempts,
        average_score=round(avg, 4),
        items=[ProgressOut.model_validate(row) for row in rows],
    )
