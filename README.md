# 📅 TimeTable Pro — School & College Schedule Manager

A full-stack timetable management system built with **Django REST Framework**, **React**, and **PostgreSQL**.

---

## 🌐 Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://class-scheduler-nu.vercel.app/login` |
| Backend API | Railway | `http://class-scheduler-pr.up.railway.app/` |
| Database | PostgreSQL on Railway | Managed via Railway |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL (Railway) |
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS (Inter + Sora fonts) — Light & Dark mode |
| Frontend Host | Vercel |
| Backend Host | Railway |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — manage teachers, students, classes, subjects, time slots, build timetables |
| **Teacher** | View personal timetable & any section's timetable |
| **Student** | View own timetable based on assigned section |

---

## ✨ Features

- 🔐 JWT-based login with role-based access control
- 👩‍🏫 Teacher management (create accounts, assign departments/subjects)
- 🏫 Class & Section management
- 📚 Subject management with department grouping
- ⏰ Flexible time slot creation (periods + breaks)
- 📅 Interactive timetable builder (click to assign subjects/teachers per cell)
- 🎨 Color-coded timetable grid by subject
- ✅ Teacher conflict detection (prevents double-booking)
- 👨‍🎓 Student management with section assignment
- 📊 Admin dashboard with statistics
- 🌙 Light / Dark mode toggle
- 📱 Fully responsive — mobile drawer sidebar

---

## 🚀 Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (or use SQLite for quick testing)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure database in timetable_backend/settings.py
# For local PostgreSQL:
# DATABASES = { 'default': { 'ENGINE': 'django.db.backends.postgresql', ... } }

# Run migrations
python manage.py migrate

# Seed demo data
python manage.py seed_data

# Start server
python manage.py runserver
# → http://localhost:8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm start
# → http://localhost:3000
```

---

## 🔑 Demo Login Credentials

After running `python manage.py seed_data`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher1@school.com | teacher123 |
| Student | student1@school.com | student123 |

---

## ☁️ Deployment

### Backend — Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a **PostgreSQL** service to the project — Railway auto-injects the `DATABASE_URL` environment variable
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Add these environment variables in Railway → your backend service → **Variables**:

   | Variable | Value |
   |----------|-------|
   | `SECRET_KEY` | your-django-secret-key |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `*` |
   | `DATABASE_URL` | *(auto-set by Railway PostgreSQL plugin)* |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

5. Railway will use `railway.json` at the repo root for build/start:

   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": { "builder": "NIXPACKS" },
     "deploy": {
       "startCommand": "cd backend && python manage.py migrate && gunicorn timetable_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

6. After deploy, go to **Settings → Networking → Generate Domain** to get your public URL

> ⚠️ **Important:** Gunicorn must bind to `$PORT` (Railway's dynamic port). Never hardcode a port number.

#### PostgreSQL setup in `settings.py`

```python
import os
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}
```

Add `dj-database-url` and `psycopg2-binary` to `requirements.txt`:

```
dj-database-url>=2.1.0
psycopg2-binary>=2.9.9
gunicorn>=21.2.0
```

---

### Frontend — Vercel

1. Go to [Vercel](https://vercel.com) → **New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add this environment variable in Vercel → **Settings → Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `REACT_APP_API_URL` | `https://your-backend.up.railway.app/api` |

4. Vercel auto-detects React and sets the build command to `npm run build` and output to `build/`
5. Deploy — Vercel assigns a `*.vercel.app` domain automatically

#### CORS — update backend after frontend deploys

Once you have your Vercel URL, update `CORS_ALLOWED_ORIGINS` in Railway environment variables:

```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

Or in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'),
]
```

---

## 📁 Project Structure

```
Class-Scheduler/
├── railway.json               ← Railway deploy config
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── timetable_backend/
│   │   ├── settings.py        ← DB + CORS + env config
│   │   └── urls.py
│   └── core/
│       ├── models.py          ← User, Teacher, ClassRoom, Section, Student, Subject, TimeSlot, TimetableEntry
│       ├── serializers.py
│       ├── views.py
│       ├── admin.py
│       └── management/commands/seed_data.py
│
└── frontend/
    └── src/
        ├── App.jsx            ← Routing + role guards
        ├── context/
        │   ├── AuthContext.js
        │   └── ThemeContext.js  ← Light/Dark mode
        ├── services/api.js    ← Axios client (reads REACT_APP_API_URL)
        ├── components/
        │   ├── layout/        ← Sidebar (mobile drawer), Layout, TopBar
        │   ├── common/        ← Modal, Table, PageHeader, StatCard
        │   └── timetable/     ← TimetableGrid
        └── pages/
            ├── auth/          ← Login
            ├── admin/         ← Dashboard, Teachers, Classes, Subjects, TimeSlots, TimetableBuilder, Students
            ├── teacher/       ← Dashboard, Timetable, Classes
            └── student/       ← Dashboard, Timetable
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login/` | Public |
| GET | `/api/users/me/` | Any auth |
| GET | `/api/users/dashboard_stats/` | Admin |
| CRUD | `/api/teachers/` | Admin |
| GET | `/api/teachers/my_profile/` | Teacher |
| GET | `/api/teachers/{id}/timetable/` | Admin/Teacher |
| CRUD | `/api/classes/` | Admin (RO: all) |
| CRUD | `/api/sections/` | Admin (RO: all) |
| GET | `/api/sections/{id}/timetable/` | Any auth |
| CRUD | `/api/subjects/` | Admin (RO: all) |
| CRUD | `/api/timeslots/` | Admin (RO: all) |
| CRUD | `/api/timetable/` | Admin (RO: all) |
| POST | `/api/timetable/bulk_update/` | Admin |
| GET | `/api/students/my_timetable/` | Student |
| CRUD | `/api/students/` | Admin |

---

## 🛠️ Customization Tips

- **Add Saturday:** The timetable grid supports Saturday — it's included in the `DAYS` array in `TimetableBuilder.jsx` and `TimetableGrid.jsx`
- **SQLite for local dev:** In `settings.py`, swap the DB config to `django.db.backends.sqlite3` — no PostgreSQL install needed locally
- **Add academic year:** Extend `TimetableEntry` with an `academic_year` field and filter timetables by it
- **Scale workers:** Increase `--workers` in the Railway start command for higher traffic (recommended: `2 * CPU cores + 1`)
