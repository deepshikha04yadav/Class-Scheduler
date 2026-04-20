# 📅 TimeTable Pro — School & College Schedule Manager

A full-stack timetable management system built with **Django REST Framework**, **React**, and **MySQL**.

---

## 🏗️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Django 4.2, Django REST Framework |
| Auth     | JWT (djangorestframework-simplejwt)|
| Database | MySQL 8+                          |
| Frontend | React 18, React Router v6         |
| Styling  | Custom CSS (Inter + Sora fonts)   |

---

## 👥 User Roles

| Role    | Capabilities |
|---------|-------------|
| **Admin**   | Full access — manage teachers, students, classes, subjects, time slots, build timetables |
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

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

---

### Backend Setup

```bash
cd backend

# Install Python packages
pip install -r requirements.txt

# Create MySQL database
mysql -u root -p
> CREATE DATABASE timetable_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;

# Update database credentials in:
# timetable_backend/settings.py → DATABASES section
# Change: NAME, USER, PASSWORD

# Run migrations
python manage.py migrate

# Seed demo data (creates admin, teachers, students, classes)
python manage.py seed_data

# Start development server
python manage.py runserver
# → API running at http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start development server
npm start
# → App running at http://localhost:3000
```

---

## 🔑 Demo Login Credentials

After running `python manage.py seed_data`:

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@school.com         | admin123    |
| Teacher | teacher1@school.com      | teacher123  |
| Student | student1@school.com      | student123  |

---

## 📁 Project Structure

```
timetable-system/
├── backend/
│   ├── core/
│   │   ├── models.py          # User, Teacher, ClassRoom, Section, Student, Subject, TimeSlot, TimetableEntry
│   │   ├── serializers.py     # DRF serializers with validation
│   │   ├── views.py           # ViewSets with role-based permissions
│   │   ├── admin.py           # Django admin registrations
│   │   └── management/commands/seed_data.py
│   ├── timetable_backend/
│   │   ├── settings.py        # Django settings (update DB credentials here)
│   │   └── urls.py            # URL routing
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── App.jsx            # Routing + role guards
        ├── context/AuthContext.js
        ├── services/api.js    # Axios API client
        ├── components/
        │   ├── layout/        # Sidebar, Layout
        │   ├── common/        # Modal, Table, PageHeader, StatCard
        │   └── timetable/     # TimetableGrid
        └── pages/
            ├── auth/Login.jsx
            ├── admin/         # Dashboard, Teachers, Classes, Subjects, TimeSlots, TimetableBuilder, Students
            ├── teacher/       # TeacherDashboard, TeacherTimetable, TeacherClasses
            └── student/       # StudentDashboard, StudentTimetable
```

---

## 🔌 API Endpoints

| Method | Endpoint                          | Access       |
|--------|-----------------------------------|--------------|
| POST   | `/api/auth/login/`                | Public       |
| GET    | `/api/users/me/`                  | Any auth     |
| GET    | `/api/users/dashboard_stats/`     | Admin        |
| CRUD   | `/api/teachers/`                  | Admin        |
| GET    | `/api/teachers/my_profile/`       | Teacher      |
| GET    | `/api/teachers/{id}/timetable/`   | Admin/Teacher|
| CRUD   | `/api/classes/`                   | Admin (RO: all)|
| CRUD   | `/api/sections/`                  | Admin (RO: all)|
| GET    | `/api/sections/{id}/timetable/`   | Any auth     |
| CRUD   | `/api/subjects/`                  | Admin (RO: all)|
| CRUD   | `/api/timeslots/`                 | Admin (RO: all)|
| CRUD   | `/api/timetable/`                 | Admin (RO: all)|
| POST   | `/api/timetable/bulk_update/`     | Admin        |
| GET    | `/api/students/my_timetable/`     | Student      |
| CRUD   | `/api/students/`                  | Admin        |

---

## 🛠️ Customization Tips

1. **Add Saturday**: The timetable grid already supports Saturday — it's included in `DAYS` array in `TimetableBuilder.jsx` and `TimetableGrid.jsx`.

2. **Change DB to SQLite** (for quick testing): In `settings.py`, comment out the MySQL config and uncomment the SQLite block.

3. **Production deployment**: Set `DEBUG=False`, configure `ALLOWED_HOSTS`, use environment variables for secrets.

4. **Add academic year**: Extend the `TimetableEntry` model with an `academic_year` field and filter by it.
