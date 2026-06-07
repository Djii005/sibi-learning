"""Pydantic models exchanged with the frontend."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    display_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class SignOut(BaseModel):
    id: int
    label: str
    description: str
    instructions: str
    image_alt: str
    image_url: str
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class LessonOut(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    category: str
    order_index: int
    is_dynamic: bool

    model_config = ConfigDict(from_attributes=True)


class LessonDetail(LessonOut):
    signs: list[SignOut]


class ProgressIn(BaseModel):
    sign_id: int
    score: float = Field(ge=0.0, le=1.0)
    correct: bool


class ProgressOut(BaseModel):
    sign_id: int
    best_score: float
    attempts: int
    correct: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressSummary(BaseModel):
    total_signs: int
    mastered_signs: int
    attempts: int
    average_score: float
    items: list[ProgressOut]
