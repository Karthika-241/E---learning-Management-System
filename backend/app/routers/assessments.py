from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/courses", tags=["assessments"])


# ---------- Question CRUD (instructor / admin) ----------

@router.get("/{course_id}/questions/all", response_model=List[schemas.QuestionAdminOut])
def get_all_questions(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    return db.query(models.Question).filter(
        models.Question.course_id == course_id
    ).order_by(models.Question.id).all()


@router.post("/{course_id}/questions", response_model=schemas.QuestionAdminOut)
def create_question(course_id: int, payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    question = models.Question(course_id=course_id, **payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.put("/{course_id}/questions/{question_id}", response_model=schemas.QuestionAdminOut)
def update_question(course_id: int, question_id: int, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        models.Question.course_id == course_id,
    ).first()
    if not question:
        raise HTTPException(404, "Question not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/{course_id}/questions/{question_id}")
def delete_question(course_id: int, question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(
        models.Question.id == question_id,
        models.Question.course_id == course_id,
    ).first()
    if not question:
        raise HTTPException(404, "Question not found")
    db.delete(question)
    db.commit()
    return {"ok": True}


@router.get("/{course_id}/questions", response_model=list[schemas.QuestionOut])
def get_questions(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(404, "Course not found")

    questions = db.query(models.Question).filter(
        models.Question.course_id == course_id
    ).all()

    if not questions:
        return []

    # return 20 random questions
    random.seed()
    sample = random.sample(questions, min(20, len(questions)))
    return sample


@router.post("/{course_id}/quiz", response_model=schemas.QuizResult)
def submit_quiz(course_id: int, payload: schemas.QuizSubmit, db: Session = Depends(get_db)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(404, "Course not found")

    user = db.query(models.User).get(payload.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    questions = db.query(models.Question).filter(
        models.Question.course_id == course_id
    ).all()

    if not questions:
        raise HTTPException(400, "No questions for this course")

    q_map = {q.id: q for q in questions}
    score = 0
    total = len(payload.answers)

    for qid, answer in payload.answers.items():
        qid = int(qid)
        if qid in q_map and answer == q_map[qid].correct_option:
            score += 1

    passed = score >= total * 0.5

    attempt = models.QuizAttempt(
        user_id=payload.user_id,
        course_id=course_id,
        score=score,
        total=total,
    )
    db.add(attempt)
    db.commit()

    return schemas.QuizResult(
        score=score,
        total=total,
        passed=passed,
        message=f"You scored {score}/{total}. {'🎉 Congratulations!' if passed else 'Keep learning and try again!'}",
    )


@router.get("/{course_id}/quiz/attempts")
def get_quiz_attempts(
    course_id: int,
    user_id: int = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.course_id == course_id
    )
    if user_id is not None:
        q = q.filter(models.QuizAttempt.user_id == user_id)

    q = q.order_by(models.QuizAttempt.completed_at.desc()).all()
    return [
        {
            "id": a.id,
            "score": a.score,
            "total": a.total,
            "passed": a.score >= a.total * 0.5,
            "completed_at": a.completed_at.isoformat(),
        }
        for a in q
    ]
