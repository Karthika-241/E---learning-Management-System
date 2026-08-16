from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
import uuid

from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _course_query(db: Session):
    return db.query(models.Course).options(
        joinedload(models.Course.category),
        joinedload(models.Course.instructor),
    ).filter(models.Course.published == True)  # noqa: E712


@router.get("", response_model=list[schemas.CourseCard])
def list_courses(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Search title/subtitle"),
    category_slug: Optional[str] = None,
    level: Optional[str] = None,
    sort: str = Query("popular", pattern="^(popular|newest|price_low|price_high|rating)$"),
):
    query = _course_query(db)

    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Course.title.ilike(like)) | (models.Course.subtitle.ilike(like))
        )
    if category_slug:
        query = query.join(models.Category).filter(models.Category.slug == category_slug)
    if level:
        query = query.filter(models.Course.level == level)

    if sort == "newest":
        query = query.order_by(models.Course.created_at.desc())
    elif sort == "price_low":
        query = query.order_by(models.Course.price.asc())
    elif sort == "price_high":
        query = query.order_by(models.Course.price.desc())

    courses = query.all()
    cards = [crud.to_course_card(db, c) for c in courses]

    if sort == "popular":
        cards.sort(key=lambda c: c.student_count, reverse=True)
    elif sort == "rating":
        cards.sort(key=lambda c: c.avg_rating, reverse=True)

    return cards


@router.get("/instructor/{instructor_id}", response_model=list[schemas.CourseCard])
def courses_by_instructor(instructor_id: int, db: Session = Depends(get_db)):
    courses = _course_query(db).filter(models.Course.instructor_id == instructor_id).all()
    return [crud.to_course_card(db, c) for c in courses]


@router.get("/{course_id}", response_model=schemas.CourseDetail)
def get_course(course_id: int, viewer_id: Optional[int] = None, db: Session = Depends(get_db)):
    course = db.get(
        models.Course, course_id,
        options=[
            joinedload(models.Course.category),
            joinedload(models.Course.instructor),
            joinedload(models.Course.sections).joinedload(models.Section.lectures),
            joinedload(models.Course.reviews).joinedload(models.Review.user),
        ],
    )
    if not course:
        raise HTTPException(404, "Course not found")
    return crud.to_course_detail(db, course, viewer_id)


@router.post("", response_model=schemas.CourseDetail)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    """Instructor 'publish a course' flow - everything in one call:
    course + sections + lectures, no drafts/review queue."""
    instructor = db.get(models.User, payload.instructor_id)
    if not instructor or instructor.role != "instructor":
        raise HTTPException(400, "instructor_id must belong to a user with role=instructor")
    if not db.get(models.Category, payload.category_id):
        raise HTTPException(400, "category_id does not exist")

    course = models.Course(
        title=payload.title,
        subtitle=payload.subtitle,
        description=payload.description,
        level=payload.level,
        language=payload.language,
        price=payload.price,
        thumbnail_seed=payload.thumbnail_seed or uuid.uuid4().hex[:12],
        category_id=payload.category_id,
        instructor_id=payload.instructor_id,
    )
    for s_idx, section_in in enumerate(payload.sections):
        section = models.Section(title=section_in.title, order=section_in.order or s_idx)
        for l_idx, lecture_in in enumerate(section_in.lectures):
            section.lectures.append(models.Lecture(
                title=lecture_in.title,
                duration_minutes=lecture_in.duration_minutes,
                video_url=lecture_in.video_url,
                order=lecture_in.order or l_idx,
                is_preview=lecture_in.is_preview,
            ))
        course.sections.append(section)

    db.add(course)
    db.flush()

    # auto-enroll the instructor so they can immediately access the player
    auto_enroll = models.Enrollment(user_id=payload.instructor_id, course_id=course.id)
    db.add(auto_enroll)

    db.commit()
    db.refresh(course)
    return crud.to_course_detail(db, course, payload.instructor_id)


@router.put("/{course_id}", response_model=schemas.CourseDetail)
def update_course(course_id: int, payload: schemas.CourseUpdate, db: Session = Depends(get_db)):
    course = db.get(
        models.Course, course_id,
        options=[joinedload(models.Course.sections).joinedload(models.Section.lectures)],
    )
    if not course:
        raise HTTPException(404, "Course not found")

    if payload.title is not None:
        course.title = payload.title
    if payload.subtitle is not None:
        course.subtitle = payload.subtitle
    if payload.description is not None:
        course.description = payload.description
    if payload.level is not None:
        course.level = payload.level
    if payload.price is not None:
        course.price = payload.price
    if payload.thumbnail_seed is not None:
        course.thumbnail_seed = payload.thumbnail_seed
    if payload.category_id is not None:
        if not db.get(models.Category, payload.category_id):
            raise HTTPException(400, "category_id does not exist")
        course.category_id = payload.category_id

    if payload.sections is not None:
        # remove old sections/lectures
        for old_sec in course.sections:
            db.delete(old_sec)
        # add new ones
        for s_idx, section_in in enumerate(payload.sections):
            section = models.Section(title=section_in.title, order=section_in.order or s_idx)
            for l_idx, lecture_in in enumerate(section_in.lectures):
                section.lectures.append(models.Lecture(
                    title=lecture_in.title,
                    duration_minutes=lecture_in.duration_minutes,
                    video_url=lecture_in.video_url,
                    order=lecture_in.order or l_idx,
                    is_preview=lecture_in.is_preview,
                ))
            course.sections.append(section)

    db.commit()

    course = db.get(
        models.Course, course_id,
        options=[
            joinedload(models.Course.category),
            joinedload(models.Course.instructor),
            joinedload(models.Course.sections).joinedload(models.Section.lectures),
            joinedload(models.Course.reviews).joinedload(models.Review.user),
        ],
    )
    return crud.to_course_detail(db, course, None)


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.get(models.Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    db.delete(course)
    db.commit()
    return {"ok": True, "message": "Course deleted"}
