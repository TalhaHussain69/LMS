# Registrum — Learning Management System

A full-stack Learning Management System built with **Node.js, Express, and MySQL** on the backend, and **plain HTML/CSS/vanilla JavaScript** on the frontend — no frameworks. Built following **Clean Architecture**, **SOLID principles**, and **Role-Based Access Control (RBAC)**.

Started as a Student Management System (SMS) assignment and evolved into a complete mini-LMS: course content, assignments, quizzes, attendance, grading, analytics dashboards, and three distinct user roles (Admin, Teacher, Student).

---

## Features

### Core Records (SMS)
- Student, Course, Enrollment, Attendance, Grade management (full CRUD)

### Authentication & Roles
- JWT-based login/registration
- Three roles: **Admin**, **Teacher**, **Student** — each with a different dashboard and different data access

### Learning Management (LMS)
- **Lessons** — text/video/link/PDF content per course, with per-student completion tracking
- **Assignments** — teachers post, students submit, teachers grade
- **Quizzes** — multiple-choice, auto-graded server-side (students never receive the answer key)
- **Announcements** — global or course-specific notices
- **Analytics Dashboard** — role-aware charts (Admin sees the whole system, Teacher sees only their courses, Student sees only their own progress)
- **Admin "Manage Users" panel** — create/edit/reset-password/delete any account

### Security (RBAC)
- Every route requires a valid JWT (`Authorization: Bearer <token>`)
- **Admin** — unrestricted access
- **Teacher** — only their own courses and the students enrolled in them
- **Student** — only their own profile, enrollments, attendance, grades, assignments, and quiz results — never another student's data

### UI/UX
- Dark/Light theme (persisted in `localStorage`)
- Collapsible sidebar, animated charts (Chart.js), skeleton loading, toast notifications, SweetAlert2 confirmations, live search, confetti celebrations, responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Frontend | HTML5, CSS3, Vanilla JavaScript (no framework) |
| Charts | Chart.js |
| UI extras | SweetAlert2, canvas-confetti |

---

## Project Structure

```
student-manage-system/
├── backend/
│   ├── server.js                  # entry point
│   ├── package.json
│   ├── .env                       # DB credentials, JWT secret (not committed)
│   └── src/
│       ├── domain/                # Entities + repository interfaces (pure business rules)
│       │   ├── entities/
│       │   └── repositories/
│       ├── application/
│       │   └── services/          # Business logic / use-cases
│       ├── infrastructure/
│       │   ├── database/          # MySQL connection + schema.sql migrations
│       │   └── repositories/      # MySQL implementations of the repository interfaces
│       └── presentation/
│           ├── routes/            # Express routers
│           ├── controllers/       # Request/response handling
│           └── middlewares/       # auth, error handling
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── api.js                 # fetch wrapper for every backend endpoint
        └── app.js                 # UI logic, rendering, event handlers
```

This follows **Clean Architecture**: each layer only knows about the layer directly beneath it. The Domain layer has zero knowledge of MySQL or HTTP — it could be reused with any database or delivery mechanism.

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server

### 1. Database
```bash
mysql -u <user> -p < backend/src/infrastructure/database/schema.sql
mysql -u <user> -p std_manage < backend/src/infrastructure/database/add_users_table.sql
mysql -u <user> -p std_manage < backend/src/infrastructure/database/add_lms_tables.sql
```

### 2. Environment variables
Create `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=std_manage
JWT_SECRET=a_long_random_string
```

### 3. Install & run
```bash
cd backend
npm install
node server.js
```

Then open **http://localhost:5000** — the backend serves the frontend directly, no separate frontend server needed.

---

## API Reference (summary)

All routes are prefixed with `/api`. All routes except `/auth/register` and `/auth/login` require a Bearer token.

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, me |
| Students | `/students` | `/me` for own profile; list/detail scoped by role |
| Courses | `/courses` | list scoped by role (own courses for teacher/student) |
| Enrollments | `/enrollments` | `/student/:id` scoped |
| Attendance | `/attendance` | `/student/:id` scoped |
| Grades | `/grades` | `/student/:id` scoped |
| Lessons | `/lessons` | `/course/:id` — requires course access |
| Assignments | `/assignments` | `/course/:id`; submissions under `/submissions` |
| Quizzes | `/quizzes` | `/course/:id`; attempts under `/quiz-attempts` |
| Announcements | `/announcements` | scoped: global + accessible courses |
| Analytics | `/analytics/dashboard` | role-aware payload |
| Users (Admin only) | `/users` | full account management |

---

## Known Limitations

- **`students` vs `users` identity gap**: the original SMS `students` table (used by Enrollments/Attendance/Grades) and the `users` table (used by Auth/Lessons/Assignments/Quizzes) are matched by **email**, not a shared foreign key. If a student's login email differs from their student-record email, their personal analytics/attendance/grades will appear empty until an admin aligns the two records. A proper fix would add a `user_id` column linking the two tables.
- No automated test suite yet.
- No certificate generation or payment processing module.

---

## Architecture & Design Principles

See `AGENTS.md` for a deeper explanation of the layering rules, RBAC helper pattern, and conventions to follow when extending this project.
