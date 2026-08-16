import hashlib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    """All demo identities. The frontend uses this to populate the
    'Switch user' menu that stands in for a login system."""
    return db.query(models.User).all()


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@router.post("", response_model=schemas.UserOut)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a user identity, optionally with login credentials."""
    payload_data = payload.model_dump(exclude_unset=True)

    if payload.email:
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            raise HTTPException(409, "Email already registered")

    if payload.password is not None:
        payload_data["password_hash"] = _hash_password(payload.password)
        payload_data.pop("password", None)

    user = models.User(**payload_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/signup", response_model=schemas.UserOut)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(400, "Email and password are required")
    return create_user(payload, db)


@router.post("/login", response_model=schemas.UserOut)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not user.password_hash:
        raise HTTPException(401, "Invalid email or password")

    if user.password_hash != _hash_password(payload.password):
        raise HTTPException(401, "Invalid email or password")

    return user
