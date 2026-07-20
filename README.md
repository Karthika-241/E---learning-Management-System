# Learnly — a Udemy-style course marketplace (no auth, no payments)

A full-stack course marketplace clone: browse courses, watch lectures, track
progress, leave reviews, and publish courses as an instructor — with **no
login system and no payment/checkout flow**.

## How "no auth" and "no payments" actually work

Rather than just deleting those features, both are replaced with something
that keeps the app usable end-to-end:

- **No auth → a persona switcher.** The user menu (top-right) lists a handful
  of demo people (a few students, a few instructors). Clicking one "becomes"
  that person for the rest of the session — no password, no session tokens.
  You can also create a brand-new persona via **Become an instructor**. This
  is stored in the browser (`localStorage`) purely to remember *which* demo
  user you last picked, not for any security purpose.
- **No payments → instant enrollment.** Clicking **Enroll** immediately
  creates an enrollment row and drops the course into "My Learning." There's
  no cart, no price checkout, no card form — price is shown for realism but
  is never actually charged.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Frontend:** React + Vite + Tailwind CSS + React Router (`frontend/`)
- Videos are public sample MP4s (Big Buck Bunny / Elephants Dream) and
  thumbnails come from picsum.photos — swap these for real media whenever
  you plug in real content.

## Project structure

```
udemy-clone/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, startup seeding
│   │   ├── models.py          # SQLAlchemy tables
│   │   ├── schemas.py         # Pydantic request/response shapes
│   │   ├── crud.py            # shared query/serialization helpers
│   │   ├── seed.py            # demo users/categories/courses
│   │   └── routers/           # users, categories, courses, enrollments, reviews
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/client.js       # all backend calls in one place
    │   ├── context/CurrentUserContext.jsx   # the persona switcher
    │   ├── components/         # Navbar, CourseCard, ProgressRing, ...
    │   └── pages/               # Home, CourseListing, CourseDetail,
    │                             # MyLearning, CoursePlayer,
    │                             # InstructorDashboard, CreateCourse, ...
    └── package.json
```

## Running it locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://127.0.0.1:8000
```

A `udemy_clone.db` SQLite file is created automatically on first run and
seeded with demo users, categories, and 8 courses (with sections, lectures,
enrollments, and reviews already filled in) so the app doesn't look empty.
Interactive API docs live at `http://127.0.0.1:8000/docs`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

By default the frontend talks to `http://127.0.0.1:8000`. To point it
somewhere else, create `frontend/.env` with:

```
VITE_API_BASE=http://your-backend-host:8000
```

## Feature tour

| Area | What it does |
|---|---|
| Home | Search-first hero, category chips, trending courses |
| Explore (`/courses`) | Search, category/level filters, sorting |
| Course detail | Curriculum accordion, instructor card, reviews, instant enroll |
| My Learning | Enrolled courses with a progress ring per course |
| Course player | Video playback, lecture list, mark-complete progress tracking |
| Instructor dashboard | Your published courses, student counts, ratings |
| Create course | Publish a course with sections/lectures — goes live immediately |
| Become an instructor | Adds a new demo persona with the instructor role |

## Extending this later

If you outgrow the "no auth / no payments" scope, the seams are already
there: swap `CurrentUserContext` for a real login (e.g. JWT) and the
`user_id`/`viewer_id` params threaded through the API for a session-derived
identity; add a `Stripe`/Razorpay checkout step before the existing
`POST /api/enrollments` call fires.
