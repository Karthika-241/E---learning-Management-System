from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ---------- Users ----------
class UserOut(BaseModel):
    id: int
    name: str
    role: str
    headline: str
    avatar_emoji: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    role: str = "student"
    headline: str = ""
    avatar_emoji: str = "🙂"
    email: Optional[str] = None
    password: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


# ---------- Categories ----------
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    icon: str

    class Config:
        from_attributes = True


# ---------- Lectures ----------
class LectureOut(BaseModel):
    id: int
    title: str
    duration_minutes: int
    video_url: str
    order: int
    is_preview: bool
    completed: bool = False  # populated per-viewer

    class Config:
        from_attributes = True


class LectureCreate(BaseModel):
    title: str
    duration_minutes: int = 5
    video_url: str = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    order: int = 0
    is_preview: bool = False


# ---------- Sections ----------
class SectionOut(BaseModel):
    id: int
    title: str
    order: int
    lectures: List[LectureOut] = []

    class Config:
        from_attributes = True


class SectionCreate(BaseModel):
    title: str
    order: int = 0
    lectures: List[LectureCreate] = []


# ---------- Reviews ----------
class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    user_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


# ---------- Courses ----------
class CourseCard(BaseModel):
    """Lightweight shape used for grid/listing views."""
    id: int
    title: str
    subtitle: str
    level: str
    price: float
    thumbnail_seed: str
    category: Optional[CategoryOut] = None
    instructor: Optional[UserOut] = None
    avg_rating: float = 0.0
    review_count: int = 0
    student_count: int = 0

    class Config:
        from_attributes = True


class CourseDetail(CourseCard):
    description: str
    language: str
    created_at: datetime
    sections: List[SectionOut] = []
    reviews: List[ReviewOut] = []
    is_enrolled: bool = False


class CourseCreate(BaseModel):
    title: str
    subtitle: str = ""
    description: str = ""
    level: str = "Beginner"
    language: str = "English"
    price: float = 0.0
    thumbnail_seed: Optional[str] = None
    category_id: int
    instructor_id: int
    sections: List[SectionCreate] = []


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    price: Optional[float] = None
    thumbnail_seed: Optional[str] = None
    category_id: Optional[int] = None
    sections: Optional[List[SectionCreate]] = None


# ---------- Enrollment ----------
class EnrollmentCreate(BaseModel):
    user_id: int
    course_id: int


class EnrollmentOut(BaseModel):
    id: int
    course: CourseCard
    enrolled_at: datetime
    progress_percent: float = 0.0

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    user_id: int
    completed: bool = True


# ---------- Quiz ----------
class QuestionOut(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str = Field(pattern="^[abcd]$")


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = Field(None, pattern="^[abcd]$")


class QuestionAdminOut(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    user_id: int
    answers: dict  # {question_id: "a"|"b"|"c"|"d"}


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    message: str
