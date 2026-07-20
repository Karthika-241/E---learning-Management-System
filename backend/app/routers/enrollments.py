from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


@router.post("", response_model=schemas.EnrollmentOut)
def enroll(payload: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    """Instant enrollment - no cart, no payment form. Click it, you're in."""
    course = db.query(models.Course).options(
        joinedload(models.Course.sections).joinedload(models.Section.lectures)
    ).get(payload.course_id)
    if not course:
        raise HTTPException(404, "Course not found")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == payload.user_id,
        models.Enrollment.course_id == payload.course_id,
    ).first()
    if existing:
        raise HTTPException(400, "Already enrolled")

    enrollment = models.Enrollment(user_id=payload.user_id, course_id=payload.course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return schemas.EnrollmentOut(
        id=enrollment.id,
        course=crud.to_course_card(db, course),
        enrolled_at=enrollment.enrolled_at,
        progress_percent=0.0,
    )


@router.get("/user/{user_id}", response_model=list[schemas.EnrollmentOut])
def my_learning(user_id: int, db: Session = Depends(get_db)):
    enrollments = db.query(models.Enrollment).options(
        joinedload(models.Enrollment.course).joinedload(models.Course.sections).joinedload(models.Section.lectures)
    ).filter(models.Enrollment.user_id == user_id).all()

    out = []
    for e in enrollments:
        out.append(schemas.EnrollmentOut(
            id=e.id,
            course=crud.to_course_card(db, e.course),
            enrolled_at=e.enrolled_at,
            progress_percent=crud.enrollment_progress_percent(db, user_id, e.course),
        ))
    return out


@router.put("/lectures/{lecture_id}/progress")
def set_lecture_progress(lecture_id: int, payload: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    lecture = db.query(models.Lecture).get(lecture_id)
    if not lecture:
        raise HTTPException(404, "Lecture not found")

    entry = db.query(models.LectureProgress).filter(
        models.LectureProgress.user_id == payload.user_id,
        models.LectureProgress.lecture_id == lecture_id,
    ).first()
    if not entry:
        entry = models.LectureProgress(user_id=payload.user_id, lecture_id=lecture_id)
        db.add(entry)
    entry.completed = payload.completed
    db.commit()
    return {"ok": True, "lecture_id": lecture_id, "completed": entry.completed}
