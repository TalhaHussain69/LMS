# AGENTS.md

This file documents the conventions, architecture rules, and patterns used in this
codebase. Read this before adding or modifying any feature — human or AI — so new
code stays consistent with what's already here.

---

## 1. Architecture — Clean Architecture, strictly layered

```
presentation/  (routes, controllers, middlewares)
      ↓ calls into
application/   (services — business logic / use-cases)
      ↓ calls into
infrastructure/ (repositories — MySQL queries)
      ↑ implements interfaces defined in
domain/        (entities, IRepository — pure business rules, zero DB/HTTP knowledge)
```

**Hard rules — never break these:**

1. **Controllers never touch the database directly.** A controller only:
   - reads `req.params` / `req.body` / `req.user`
   - calls exactly one service method
   - returns `res.json({ success, data | message })`

2. **Services never write raw SQL.** All persistence goes through a repository.
   Services hold business rules (validation beyond basic field checks, ordering
   of operations, cross-entity checks like "is this student enrolled?").

3. **Repositories never contain business logic.** A repository method is a thin
   wrapper around one SQL statement (or a small number of them) and returns
   plain objects or Domain entities. No `if` statements deciding business
   outcomes — only query construction.

4. **Domain entities validate themselves.** Every entity constructor calls
   `this.validate()` and throws a plain `Error` with a human-readable message
   if invalid. Controllers/services never re-implement field validation that
   belongs in the entity.

5. **Every new repository extends `domain/repositories/IRepository.js`** (or
   documents why it doesn't, e.g. read-only reporting repositories like
   `analytics.repository.js`).

---

## 2. Adding a new resource/module — the standard 6-file pattern

To add a new feature (e.g. "Certificates"), create these files in order:

1. `domain/entities/Certificate.js` — fields + `validate()`
2. `infrastructure/database/add_certificates_table.sql` — migration (never edit
   `schema.sql` or existing migration files — always add a new incremental file)
3. `infrastructure/repositories/certificate.repository.js` — extends
   `IRepository`, raw `mysql2` queries only
4. `application/services/certificate.service.js` — business logic, calls the
   repository, applies RBAC checks (see §3)
5. `presentation/controllers/certificate.controller.js` — thin, wraps every
   method in `asyncHandler`
6. `presentation/routes/certificate.routes.js` — mount `requireAuth` (and
   `requireRole(...)` for writes), then wire into `app.js`

Naming convention: singular, camelCase file stems (`quizAttempt.service.js`),
kebab/plural for URL paths (`/api/quiz-attempts`).

---

## 3. RBAC — always reuse `access.util.js`

`backend/src/application/services/access.util.js` is the **single source of
truth** for permission checks. Never write a new `if (user.role === ...)`
ownership check inline in a service — extend or reuse what's there:

- `resolveOwnStudentId(user)` — maps a logged-in student `user` to their row
  in the legacy `students` table (matched by email — see the limitation noted
  in `README.md`).
- `assertCourseAccess(courseId, user)` — throws unless the user may **read**
  content tied to a course (lessons, assignments, quizzes, attendance,
  grades, announcements). Admin always passes; teacher only their own
  course; student only if enrolled.
- `assertCanManageCourse(courseId, user)` — throws unless the user may
  **write/delete** content tied to a course. Admin always passes; teacher
  only if `course.instructor_id === user.id`.
- `assertCanViewStudent(studentId, user)` — throws unless the user may view
  a specific student's personal records (profile, attendance, grades).

Any new module that is scoped to a course or a student should call one of
these instead of re-deriving the logic. If a genuinely new access pattern is
needed, add it to `access.util.js` so it stays the one place RBAC logic
lives.

**Error messages drive HTTP status codes** — `error.middleware.js` maps
message substrings to status codes:
- contains "not found" → 404
- contains "permission" / "forbidden" / "not enrolled" / "not allowed" → 403
- contains "already" / "required" / "must be" / "invalid" / "cannot" → 400
- anything else → 500

When throwing a permission error, use `access.util.js`'s `forbidden(message)`
helper (or include one of the trigger words above) so it maps to 403
correctly.

---

## 4. Route protection checklist

Every route file must:
```js
router.use(requireAuth);              // or requireAuth per-route
```
before any handler runs. This project previously shipped 5 route files
(students, courses, enrollments, attendance, grades) with **zero**
authentication because they were written before the Auth system existed —
this was fixed, but it's a reminder: **any new route file must have
`requireAuth` from the moment it's created**, not added later as an
afterthought.

Mutation routes (`POST`/`PUT`/`DELETE`) additionally need
`requireRole('admin', 'teacher')` (or `'admin'` only) as appropriate — check
`access.util.js` for whether ownership also needs to be checked inside the
service (role alone is not enough for teacher-scoped resources).

---

## 5. Frontend conventions

- **`api.js`** is the only file that calls `fetch()`. Every backend endpoint
  gets one entry here, grouped by resource. UI code (`app.js`) never
  constructs a URL or fetch call directly.
- **`app.js`** functions follow the pattern `loadX()` (fetch + render into a
  `tbody`/list) and a paired `<form>` submit listener that calls
  `api.x.create(...)` then re-runs `loadX()`.
- Role-based UI hiding uses the `data-role-restricted="admin,teacher"` and
  `data-admin-only` attributes, toggled by `applyRoleVisibility()`. This is
  **UX only** — the backend is the actual enforcement boundary (defense in
  depth: hide what a role shouldn't act on, but never rely on hiding alone).
- New tables should get `renderSkeletonRows()` support and, if they need
  filtering, `attachTableSearch(inputId, tbodyId)` — both already generic.
- Keep the visual language consistent: serif headings (`Source Serif 4`),
  mono for codes/roll-numbers (`IBM Plex Mono`), CSS variables for all
  colors (`var(--accent)`, `var(--ink)`, etc.) so dark/light theming keeps
  working automatically. Don't hardcode hex colors in new CSS.

---

## 6. Things intentionally left undone

- No automated test suite — if adding one, use Jest; unit-test entities and
  services, integration-test routes with `supertest`.
- No `user_id` link between `students` and `users` tables — student identity
  resolution is done by email match (`resolveOwnStudentId`). Don't build new
  features that assume these are the same row without checking this first.
- No certificate generation or payment processing.
