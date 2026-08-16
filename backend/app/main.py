from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import SessionLocal, ensure_schema
from .seed import seed
from .routers import courses, categories, enrollments, reviews, users, assessments

ensure_schema()

with SessionLocal() as db:
    seed(db)

app = FastAPI(
    title="Udemy Clone API",
    description="A course marketplace API with no authentication and no payments. "
                 "Identity is simulated by picking a demo user; enrollment is instant "
                 "and free.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(reviews.router)
app.include_router(assessments.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
