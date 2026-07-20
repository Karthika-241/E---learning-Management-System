from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    """A demo 'identity' the app can act as - no password, no auth.
    The frontend just lets people switch between these to simulate
    being a student or an instructor."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # student | instructor
    headline = Column(String, default="")
    avatar_emoji = Column(String, default="🙂")

    courses = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    icon = Column(String, default="📚")

    courses = relationship("Course", back_populates="category")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, default="")
    description = Column(Text, default="")
    level = Column(String, default="Beginner")  # Beginner | Intermediate | Advanced
    language = Column(String, default="English")
    price = Column(Float, default=0.0)  # display only - never charged
    thumbnail_seed = Column(String, default="course")
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category_id = Column(Integer, ForeignKey("categories.id"))
    instructor_id = Column(Integer, ForeignKey("users.id"))

    category = relationship("Category", back_populates="courses")
    instructor = relationship("User", back_populates="courses")
    sections = relationship(
        "Section", back_populates="course",
        cascade="all, delete-orphan", order_by="Section.order"
    )
    enrollments = relationship("Enrollment", back_populates="course")
    reviews = relationship("Review", back_populates="course")
    questions = relationship("Question", back_populates="course", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    order = Column(Integer, default=0)
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="sections")
    lectures = relationship(
        "Lecture", back_populates="section",
        cascade="all, delete-orphan", order_by="Lecture.order"
    )


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=5)
    video_url = Column(String, default="")
    order = Column(Integer, default=0)
    is_preview = Column(Boolean, default=False)  # watchable without enrolling
    section_id = Column(Integer, ForeignKey("sections.id"))

    section = relationship("Section", back_populates="lectures")
    progress_entries = relationship(
        "LectureProgress", back_populates="lecture", cascade="all, delete-orphan"
    )


class Enrollment(Base):
    """Created the instant someone clicks 'Enroll' - no cart, no payment step."""
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class LectureProgress(Base):
    __tablename__ = "lecture_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lecture_id = Column(Integer, ForeignKey("lectures.id"))
    completed = Column(Boolean, default=False)

    lecture = relationship("Lecture", back_populates="progress_entries")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))

    user = relationship("User", back_populates="reviews")
    course = relationship("Course", back_populates="reviews")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    question_text = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)  # 'a', 'b', 'c', or 'd'

    course = relationship("Course", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    score = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=20)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    course = relationship("Course")
