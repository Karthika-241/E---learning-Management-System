from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas


def course_stats(db: Session, course_id: int):
    """Average rating, review count, enrolled student count for one course."""
    avg_rating, review_count = db.query(
        func.coalesce(func.avg(models.Review.rating), 0.0),
        func.count(models.Review.id),
    ).filter(models.Review.course_id == course_id).one()

    student_count = db.query(func.count(models.Enrollment.id)).filter(
        models.Enrollment.course_id == course_id
    ).scalar()

    return round(float(avg_rating), 1), review_count, student_count


def to_course_card(db: Session, course: models.Course) -> schemas.CourseCard:
    avg_rating, review_count, student_count = course_stats(db, course.id)
    return schemas.CourseCard(
        id=course.id,
        title=course.title,
        subtitle=course.subtitle,
        level=course.level,
        price=course.price,
        thumbnail_seed=course.thumbnail_seed,
        category=course.category,
        instructor=course.instructor,
        avg_rating=avg_rating,
        review_count=review_count,
        student_count=student_count,
    )


def to_course_detail(db: Session, course: models.Course, viewer_id: int | None) -> schemas.CourseDetail:
    card = to_course_card(db, course)

    is_enrolled = False
    completed_lecture_ids: set[int] = set()
    if viewer_id is not None:
        is_enrolled = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id,
            models.Enrollment.user_id == viewer_id,
        ).first() is not None

        rows = db.query(models.LectureProgress.lecture_id).filter(
            models.LectureProgress.user_id == viewer_id,
            models.LectureProgress.completed == True,  # noqa: E712
        ).all()
        completed_lecture_ids = {r[0] for r in rows}

    sections_out = []
    for section in course.sections:
        lectures_out = []
        for lecture in section.lectures:
            lec = schemas.LectureOut.model_validate(lecture)
            lec.completed = lecture.id in completed_lecture_ids
            lectures_out.append(lec)
        sections_out.append(schemas.SectionOut(
            id=section.id, title=section.title, order=section.order, lectures=lectures_out
        ))

    reviews_out = [schemas.ReviewOut.model_validate(r) for r in course.reviews]

    return schemas.CourseDetail(
        **card.model_dump(),
        description=course.description,
        language=course.language,
        created_at=course.created_at,
        sections=sections_out,
        reviews=reviews_out,
        is_enrolled=is_enrolled,
    )


def enrollment_progress_percent(db: Session, user_id: int, course: models.Course) -> float:
    lecture_ids = [
        lec.id for sec in course.sections for lec in sec.lectures
    ]
    if not lecture_ids:
        return 0.0
    completed = db.query(func.count(models.LectureProgress.id)).filter(
        models.LectureProgress.user_id == user_id,
        models.LectureProgress.lecture_id.in_(lecture_ids),
        models.LectureProgress.completed == True,  # noqa: E712
    ).scalar()
    return round(100 * completed / len(lecture_ids), 1)
