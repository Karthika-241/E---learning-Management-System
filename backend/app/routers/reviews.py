from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/courses", tags=["reviews"])


@router.post("/{course_id}/reviews", response_model=schemas.ReviewOut)
def add_review(course_id: int, payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    is_enrolled = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == payload.user_id,
        models.Enrollment.course_id == course_id,
    ).first()
    if not is_enrolled:
        raise HTTPException(400, "Only enrolled students can review this course")

    existing = db.query(models.Review).filter(
        models.Review.user_id == payload.user_id,
        models.Review.course_id == course_id,
    ).first()
    if existing:
        existing.rating = payload.rating
        existing.comment = payload.comment
        db.commit()
        db.refresh(existing)
        return db.query(models.Review).options(joinedload(models.Review.user)).get(existing.id)

    review = models.Review(
        rating=payload.rating, comment=payload.comment,
        user_id=payload.user_id, course_id=course_id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return db.query(models.Review).options(joinedload(models.Review.user)).get(review.id)
