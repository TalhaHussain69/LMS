// ============================================================
// THE REGISTER — app.js
// ============================================================

let state = { students: [], courses: [], enrollments: [], attendance: [], grades: [] };
let currentUser = null;

// ---------------- Theme ----------------
const themeToggle = document.getElementById('theme-toggle');
const authThemeToggle = document.getElementById('auth-theme-toggle');
const themeLabel = document.querySelector('.theme-label');

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeLabel.textContent = theme === 'dark' ? 'Dark register' : 'Light register';
  localStorage.setItem('sms-theme', theme);
}
function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
  if (currentUser && dashboardData) setTimeout(() => loadDashboard(false), 50);
}
themeToggle.addEventListener('click', toggleTheme);
authThemeToggle.addEventListener('click', toggleTheme);
applyTheme(localStorage.getItem('sms-theme') || 'dark');

// ---------------- Sidebar collapse/expand ----------------
const sidebarCollapseBtn = document.getElementById('sidebar-collapse');
const ledgerSpine = document.querySelector('.ledger-spine');
function applySidebarState(collapsed) {
  ledgerSpine.classList.toggle('collapsed', collapsed);
  document.getElementById('app-shell').classList.toggle('sidebar-collapsed', collapsed);
  localStorage.setItem('sms-sidebar-collapsed', collapsed ? '1' : '0');
}
sidebarCollapseBtn.addEventListener('click', () => {
  applySidebarState(!ledgerSpine.classList.contains('collapsed'));
});
applySidebarState(localStorage.getItem('sms-sidebar-collapsed') === '1');

// ============================================================
// AUTH
// ============================================================
const authGate = document.getElementById('auth-gate');
const appShell = document.getElementById('app-shell');
const authError = document.getElementById('auth-error');

document.querySelectorAll('[data-auth-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-auth-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('form-login').hidden = btn.dataset.authTab !== 'login';
    document.getElementById('form-register').hidden = btn.dataset.authTab !== 'register';
    authError.hidden = true;
  });
});

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

function applyRoleVisibility() {
  const canManage = currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher');
  document.querySelectorAll('[data-role-restricted]').forEach(el => {
    el.classList.toggle('role-hidden', !canManage);
  });
  document.querySelectorAll('.btn-icon[data-del-student],.btn-icon[data-del-course],.btn-icon[data-del-enroll],.btn-icon[data-del-att],.btn-icon[data-del-grade]')
    .forEach(el => el.classList.toggle('role-hidden', !canManage));

  const isAdmin = currentUser && currentUser.role === 'admin';
  document.querySelectorAll('[data-admin-only]').forEach(el => {
    el.classList.toggle('role-hidden', !isAdmin);
  });
}

function enterApp(user) {
  currentUser = user;
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = user.role;
  authGate.hidden = true;
  appShell.hidden = false;
  applyRoleVisibility();
  checkHealth();
  refreshAll();
}

function logout() {
  localStorage.removeItem('sms-token');
  currentUser = null;
  appShell.hidden = true;
  authGate.hidden = false;
  document.getElementById('form-login').reset();
}

document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.hidden = true;
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    const result = await api.auth.login(data);
    localStorage.setItem('sms-token', result.token);
    enterApp(result.user);
  } catch (err) { showAuthError(err.message); }
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.hidden = true;
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    const result = await api.auth.register(data);
    localStorage.setItem('sms-token', result.token);
    enterApp(result.user);
  } catch (err) { showAuthError(err.message); }
});

async function tryAutoLogin() {
  const token = localStorage.getItem('sms-token');
  if (!token) return;
  try {
    const user = await api.auth.me();
    enterApp(user);
  } catch {
    localStorage.removeItem('sms-token');
  }
}

// ---------------- Tabs ----------------
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
  });
});

// ---------------- Toast ----------------
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(message, isError = false) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.toggle('error', isError);
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

// ---------------- Form open/close ----------------
document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const form = document.getElementById(btn.dataset.open);
    form.hidden = !form.hidden;
    if (!form.hidden) form.querySelector('input,select')?.focus();
  });
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const form = btn.closest('.record-form');
    form.reset();
    form.hidden = true;
  });
});

// ---------------- API status ----------------
async function checkHealth() {
  const statusEl = document.getElementById('api-status');
  try {
    await api.health();
    statusEl.classList.add('online');
    statusEl.classList.remove('offline');
    statusEl.innerHTML = '<span class="dot"></span> Backend connected';
  } catch {
    statusEl.classList.add('offline');
    statusEl.classList.remove('online');
    statusEl.innerHTML = '<span class="dot"></span> Backend offline';
  }
}

// ---------------- Helpers ----------------
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function rollNo(id) { return `#${String(id).padStart(4, '0')}`; }
function fillSelect(select, items, labelFn) {
  select.innerHTML = items.map(i => `<option value="${i.id}">${labelFn(i)}</option>`).join('');
}

// ============================================================
// STUDENTS
// ============================================================
async function loadStudents() {
  state.students = await api.students.list();
  const body = document.getElementById('students-body');
  const empty = document.getElementById('students-empty');
  empty.hidden = state.students.length > 0;

  body.innerHTML = state.students.map((s, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td>${rollNo(s.id)}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.phone || '—'}</td>
      <td>${fmtDate(s.created_at)}</td>
      <td><button class="btn-icon" data-del-student="${s.id}">Remove</button></td>
    </tr>`).join('');

  body.querySelectorAll('[data-del-student]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this student from the register?')) return;
      try {
        await api.students.remove(btn.dataset.delStudent);
        toast('Student removed');
        await refreshAll();
      } catch (e) { toast(e.message, true); }
    });
  });

  fillSelect(document.getElementById('enroll-student-select'), state.students, s => s.name);
  fillSelect(document.getElementById('att-student-select'), state.students, s => s.name);
  fillSelect(document.getElementById('grade-student-select'), state.students, s => s.name);
}

document.getElementById('form-student').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.students.create({ name: data.name, email: data.email, phone: data.phone });
    toast('Student added to the register');
    form.reset(); form.hidden = true;
    await refreshAll();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// COURSES
// ============================================================
async function loadCourses() {
  state.courses = await api.courses.list();
  const body = document.getElementById('courses-body');
  const empty = document.getElementById('courses-empty');
  empty.hidden = state.courses.length > 0;

  body.innerHTML = state.courses.map((c, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td>${c.code}</td>
      <td>${c.name}</td>
      <td>${c.credit_hours}</td>
      <td><button class="btn-icon" data-del-course="${c.id}">Remove</button></td>
    </tr>`).join('');

  body.querySelectorAll('[data-del-course]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this course from the catalogue?')) return;
      try {
        await api.courses.remove(btn.dataset.delCourse);
        toast('Course removed');
        await refreshAll();
      } catch (e) { toast(e.message, true); }
    });
  });

  const label = c => `${c.code} — ${c.name}`;
  fillSelect(document.getElementById('enroll-course-select'), state.courses, label);
  fillSelect(document.getElementById('att-course-select'), state.courses, label);
  fillSelect(document.getElementById('grade-course-select'), state.courses, label);

  fillSelect(document.getElementById('lessons-course-select'), state.courses, label);
  fillSelect(document.getElementById('assignments-course-select'), state.courses, label);
  fillSelect(document.getElementById('quizzes-course-select'), state.courses, label);

  const annSelect = document.getElementById('announcement-course-select');
  annSelect.innerHTML = '<option value="">— Site-wide —</option>' +
    state.courses.map(c => `<option value="${c.id}">${label(c)}</option>`).join('');

  if (state.courses.length) {
    if (!lessonsCourseId) lessonsCourseId = state.courses[0].id;
    if (!assignmentsCourseId) assignmentsCourseId = state.courses[0].id;
    if (!quizzesCourseId) quizzesCourseId = state.courses[0].id;
    document.getElementById('lessons-course-select').value = lessonsCourseId;
    document.getElementById('assignments-course-select').value = assignmentsCourseId;
    document.getElementById('quizzes-course-select').value = quizzesCourseId;
  }
}

document.getElementById('form-course').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.courses.create({ name: data.name, code: data.code, credit_hours: Number(data.credit_hours) });
    toast('Course added to the catalogue');
    form.reset(); form.hidden = true;
    await refreshAll();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// ENROLLMENTS
// ============================================================
async function loadEnrollments() {
  state.enrollments = await api.enrollments.list();
  const body = document.getElementById('enrollments-body');
  const empty = document.getElementById('enrollments-empty');
  empty.hidden = state.enrollments.length > 0;

  body.innerHTML = state.enrollments.map((e, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td>${e.student_name}</td>
      <td>${e.course_name}</td>
      <td>${e.course_code}</td>
      <td>${fmtDate(e.enrolled_at)}</td>
      <td><button class="btn-icon" data-del-enroll="${e.id}">Unenroll</button></td>
    </tr>`).join('');

  body.querySelectorAll('[data-del-enroll]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Unenroll this student from the course?')) return;
      try {
        await api.enrollments.remove(btn.dataset.delEnroll);
        toast('Student unenrolled');
        await refreshAll();
      } catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-enrollment').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.enrollments.create({ student_id: Number(data.student_id), course_id: Number(data.course_id) });
    toast('Student enrolled');
    form.reset(); form.hidden = true;
    await refreshAll();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// ATTENDANCE
// ============================================================
async function loadAttendance() {
  state.attendance = await api.attendance.list();
  const body = document.getElementById('attendance-body');
  const empty = document.getElementById('attendance-empty');
  empty.hidden = state.attendance.length > 0;

  body.innerHTML = state.attendance.map((a, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td>${a.student_name}</td>
      <td>${a.course_name}</td>
      <td>${fmtDate(a.date)}</td>
      <td><span class="status-pill status-${a.status}">${a.status}</span></td>
      <td><button class="btn-icon" data-del-att="${a.id}">Remove</button></td>
    </tr>`).join('');

  body.querySelectorAll('[data-del-att]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this attendance record?')) return;
      try {
        await api.attendance.remove(btn.dataset.delAtt);
        toast('Attendance record removed');
        await refreshAll();
      } catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-attendance').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.attendance.create({
      student_id: Number(data.student_id),
      course_id: Number(data.course_id),
      date: data.date,
      status: data.status
    });
    toast('Attendance marked');
    form.reset(); form.hidden = true;
    await refreshAll();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// GRADES
// ============================================================
function gradeClass(letter) {
  return `grade-${letter.replace('+', 'p')}`;
}

async function loadGrades() {
  state.grades = await api.grades.list();
  const body = document.getElementById('grades-body');
  const empty = document.getElementById('grades-empty');
  empty.hidden = state.grades.length > 0;

  body.innerHTML = state.grades.map((g, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td>${g.student_name}</td>
      <td>${g.course_name}</td>
      <td>${g.marks}</td>
      <td><span class="stamp ${gradeClass(g.grade)}">${g.grade}</span></td>
      <td><button class="btn-icon" data-del-grade="${g.id}">Remove</button></td>
    </tr>`).join('');

  body.querySelectorAll('[data-del-grade]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this grade record?')) return;
      try {
        await api.grades.remove(btn.dataset.delGrade);
        toast('Grade removed');
        await refreshAll();
      } catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-grade').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.grades.create({
      student_id: Number(data.student_id),
      course_id: Number(data.course_id),
      marks: Number(data.marks)
    });
    toast('Grade recorded');
    form.reset(); form.hidden = true;
    await refreshAll();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// DASHBOARD (Analytics — role-aware)
// ============================================================
let dashboardData = null;
const chartInstances = {};

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}
function chartPalette() {
  return [cssVar('--accent'), cssVar('--accent-gold'), cssVar('--accent-strong'), cssVar('--danger'), cssVar('--ink-dim')];
}

function renderStatCards(cards) {
  const grid = document.getElementById('stat-grid');
  grid.innerHTML = cards.map((c, i) => `
    <div class="stat-card" style="animation-delay:${i * 60}ms">
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join('');
}

function drawChart(canvasId, type, labels, data, options = {}) {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js did not load — check network/CDN access.');
    return;
  }
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

  const gridColor = cssVar('--line');
  const textColor = cssVar('--ink-dim');
  const palette = chartPalette();

  chartInstances[canvasId] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: type === 'bar' ? cssVar('--accent') : palette,
        borderColor: type === 'bar' ? cssVar('--accent-strong') : cssVar('--surface'),
        borderWidth: type === 'bar' ? 0 : 2,
        borderRadius: type === 'bar' ? 4 : 0,
        hoverOffset: type === 'bar' ? 0 : 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      animations: {
        y: { duration: 900, easing: 'easeOutQuart' }
      },
      plugins: {
        legend: { display: type !== 'bar', labels: { color: textColor, font: { family: 'IBM Plex Sans', size: 11 }, padding: 12 } }
      },
      scales: type === 'bar' ? {
        x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: 'transparent' } },
        y: { beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
      } : undefined,
      ...options
    }
  });
}

async function loadDashboard(forceRefetch = true) {
  if (forceRefetch || !dashboardData) {
    dashboardData = await api.analytics.dashboard();
  }
  const d = dashboardData;

  if (d.role === 'admin') {
    document.getElementById('dashboard-title').textContent = 'Admin Overview';
    renderStatCards([
      { value: d.totals.totalStudents, label: 'Students' },
      { value: d.totals.totalTeachers, label: 'Teachers' },
      { value: d.totals.totalCourses, label: 'Courses' },
      { value: d.totals.totalEnrollments, label: 'Enrollments' },
      { value: d.totals.totalAssignments, label: 'Assignments' },
      { value: d.totals.totalQuizzes, label: 'Quizzes' }
    ]);
    document.getElementById('chart1-title').textContent = 'Enrollments by Course';
    document.getElementById('chart2-title').textContent = 'Grade Distribution';
    document.getElementById('chart3-title').textContent = 'Attendance Summary';
    drawChart('chart1', 'bar', d.enrollmentsByCourse.map(c => c.course_name), d.enrollmentsByCourse.map(c => c.count));
    drawChart('chart2', 'doughnut', d.gradeDistribution.map(g => g.grade), d.gradeDistribution.map(g => g.count));
    drawChart('chart3', 'doughnut', d.attendance.map(a => a.status), d.attendance.map(a => a.count));

  } else if (d.role === 'teacher') {
    document.getElementById('dashboard-title').textContent = 'My Teaching Overview';
    renderStatCards([
      { value: d.totals.myCourses, label: 'My Courses' },
      { value: d.totals.totalEnrollments, label: 'Total Enrollments' }
    ]);
    document.getElementById('chart1-title').textContent = 'Enrollments by Course';
    document.getElementById('chart2-title').textContent = 'Grade Distribution';
    document.getElementById('chart3-title').textContent = 'Attendance Summary';
    drawChart('chart1', 'bar', d.enrollmentsByCourse.map(c => c.course_name), d.enrollmentsByCourse.map(c => c.count));
    drawChart('chart2', 'doughnut', d.gradeDistribution.map(g => g.grade), d.gradeDistribution.map(g => g.count));
    drawChart('chart3', 'doughnut', d.attendance.map(a => a.status), d.attendance.map(a => a.count));

  } else {
    document.getElementById('dashboard-title').textContent = 'My Progress';
    renderStatCards([
      { value: d.totals.enrolledCourses, label: 'Enrolled Courses' },
      { value: d.totals.quizzesTaken, label: 'Quizzes Taken' },
      { value: d.totals.assignmentsSubmitted, label: 'Assignments Submitted' }
    ]);
    document.getElementById('chart1-title').textContent = 'My Grades';
    document.getElementById('chart2-title').textContent = 'My Quiz Scores (%)';
    document.getElementById('chart3-title').textContent = 'My Attendance';
    drawChart('chart1', 'bar', d.grades.map(g => g.course_name), d.grades.map(g => g.marks));
    drawChart('chart2', 'bar', d.quizScores.map(q => q.quiz_title), d.quizScores.map(q => q.total_marks ? Math.round((q.score / q.total_marks) * 100) : 0));
    drawChart('chart3', 'doughnut', d.attendance.map(a => a.status), d.attendance.map(a => a.count));

    if (!d.linkedToStudentRecord) {
      toast('Tip: ask an admin to add a student record with this same email to see your attendance/grades', false);
    }
  }
}
let lessonsCourseId = null;
let assignmentsCourseId = null;
let quizzesCourseId = null;
let myTakenQuizIds = new Set();

function isManager() {
  return currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher');
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ============================================================
// LESSONS
// ============================================================
document.getElementById('lessons-course-select').addEventListener('change', (e) => {
  lessonsCourseId = Number(e.target.value);
  loadLessons();
});

async function loadLessons() {
  if (!lessonsCourseId) return;
  const lessons = await api.lessons.byCourse(lessonsCourseId);
  const list = document.getElementById('lessons-list');
  const empty = document.getElementById('lessons-empty');
  empty.hidden = lessons.length > 0;

  let progressMap = {};
  const progressCard = document.getElementById('lessons-progress');
  if (currentUser.role === 'student') {
    const progress = await api.progress.forCourse(lessonsCourseId);
    progressCard.hidden = false;
    document.getElementById('lessons-progress-label').textContent = `${progress.completed_lessons} / ${progress.total_lessons} lessons complete`;
    document.getElementById('lessons-progress-pct').textContent = `${progress.percentage}%`;
    document.getElementById('lessons-progress-fill').style.width = `${progress.percentage}%`;
  } else {
    progressCard.hidden = true;
  }

  list.innerHTML = lessons.map((l, i) => `
    <div class="item-card" style="animation-delay:${i * 40}ms">
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(l.title)}</h3>
          <div class="item-meta"><span>${l.content_type}</span><span>#${String(l.order_index).padStart(2, '0')}</span></div>
        </div>
        ${isManager() ? `<button class="btn-small danger" data-del-lesson="${l.id}">Remove</button>` : ''}
      </div>
      <p class="item-body">${escapeHtml(l.content)}</p>
      ${currentUser.role === 'student' ? `
        <div class="item-actions">
          <label class="option-row" style="cursor:pointer;">
            <input type="checkbox" data-complete-lesson="${l.id}"> Mark as complete
          </label>
        </div>` : ''}
    </div>`).join('');

  list.querySelectorAll('[data-del-lesson]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this lesson?')) return;
      try { await api.lessons.remove(btn.dataset.delLesson); toast('Lesson removed'); loadLessons(); }
      catch (e) { toast(e.message, true); }
    });
  });
  list.querySelectorAll('[data-complete-lesson]').forEach(cb => {
    cb.addEventListener('change', async () => {
      try {
        await api.progress.markComplete(cb.dataset.completeLesson, cb.checked);
        toast(cb.checked ? 'Marked complete' : 'Marked incomplete');
        loadLessons();
      } catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-lesson').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.lessons.create({ ...data, course_id: lessonsCourseId, order_index: Number(data.order_index) });
    toast('Lesson added');
    form.reset(); form.hidden = true;
    loadLessons();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// ASSIGNMENTS
// ============================================================
document.getElementById('assignments-course-select').addEventListener('change', (e) => {
  assignmentsCourseId = Number(e.target.value);
  loadAssignments();
});

function assignmentBadge(a, mySubmission) {
  if (mySubmission) {
    return mySubmission.marks_obtained !== null
      ? `<span class="badge badge-graded">Graded: ${mySubmission.marks_obtained}/${a.max_marks}</span>`
      : `<span class="badge badge-submitted">Submitted</span>`;
  }
  const overdue = new Date() > new Date(a.due_date);
  return overdue ? `<span class="badge badge-overdue">Overdue</span>` : `<span class="badge badge-pending">Pending</span>`;
}

async function loadAssignments() {
  if (!assignmentsCourseId) return;
  const assignments = await api.assignments.byCourse(assignmentsCourseId);
  const list = document.getElementById('assignments-list');
  const empty = document.getElementById('assignments-empty');
  empty.hidden = assignments.length > 0;

  let mySubmissions = [];
  if (currentUser.role === 'student') {
    mySubmissions = await api.submissions.mine();
  }

  list.innerHTML = assignments.map((a, i) => {
    const mine = mySubmissions.find(s => s.assignment_id === a.id);
    return `
    <div class="item-card" style="animation-delay:${i * 40}ms">
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(a.title)}</h3>
          <div class="item-meta"><span>Due ${fmtDate(a.due_date)}</span><span>Max ${a.max_marks} marks</span></div>
        </div>
        ${currentUser.role === 'student' ? assignmentBadge(a, mine) : ''}
        ${isManager() ? `<button class="btn-small danger" data-del-assignment="${a.id}">Remove</button>` : ''}
      </div>
      ${a.description ? `<p class="item-body">${escapeHtml(a.description)}</p>` : ''}
      <div class="item-actions">
        ${currentUser.role === 'student' && !mine ? `<button class="btn-small" data-submit-toggle="${a.id}">Submit Work</button>` : ''}
        ${currentUser.role === 'student' && mine && mine.feedback ? `<span class="item-meta">Feedback: ${escapeHtml(mine.feedback)}</span>` : ''}
        ${isManager() ? `<button class="btn-small outline" data-view-submissions="${a.id}">View Submissions</button>` : ''}
      </div>
      <div class="item-drawer" id="drawer-assignment-${a.id}" hidden></div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-del-assignment]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this assignment?')) return;
      try { await api.assignments.remove(btn.dataset.delAssignment); toast('Assignment removed'); loadAssignments(); }
      catch (e) { toast(e.message, true); }
    });
  });

  list.querySelectorAll('[data-submit-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const drawer = document.getElementById(`drawer-assignment-${btn.dataset.submitToggle}`);
      drawer.hidden = !drawer.hidden;
      if (!drawer.hidden) {
        drawer.innerHTML = `
          <textarea rows="3" placeholder="Paste your answer or a link to your work"></textarea>
          <button class="btn-small">Submit</button>`;
        drawer.querySelector('button').addEventListener('click', async () => {
          const content = drawer.querySelector('textarea').value.trim();
          if (!content) return toast('Write something before submitting', true);
          try {
            await api.submissions.submit({ assignment_id: Number(btn.dataset.submitToggle), content });
            toast('Assignment submitted');
            loadAssignments();
          } catch (e) { toast(e.message, true); }
        });
      }
    });
  });

  list.querySelectorAll('[data-view-submissions]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const assignmentId = btn.dataset.viewSubmissions;
      const drawer = document.getElementById(`drawer-assignment-${assignmentId}`);
      drawer.hidden = !drawer.hidden;
      if (drawer.hidden) return;

      const submissions = await api.submissions.byAssignment(assignmentId);
      if (submissions.length === 0) {
        drawer.innerHTML = `<p class="empty-state">No submissions yet.</p>`;
        return;
      }
      drawer.innerHTML = submissions.map(s => `
        <div class="mini-row" style="flex-direction:column; align-items:stretch; gap:.4rem;">
          <div class="mini-row" style="border:none; padding:.2rem 0;">
            <strong>${escapeHtml(s.student_name)}</strong>
            <span class="item-meta">${fmtDate(s.submitted_at)}</span>
          </div>
          <p class="item-body" style="margin:0;">${escapeHtml(s.content)}</p>
          <div style="display:flex; gap:.5rem; align-items:center;">
            <input type="number" placeholder="Marks" style="width:90px" value="${s.marks_obtained ?? ''}" data-marks-for="${s.id}">
            <input type="text" placeholder="Feedback (optional)" style="flex:1" value="${s.feedback ?? ''}" data-feedback-for="${s.id}">
            <button class="btn-small" data-grade-submission="${s.id}">Save</button>
          </div>
        </div>`).join('');

      drawer.querySelectorAll('[data-grade-submission]').forEach(gradeBtn => {
        gradeBtn.addEventListener('click', async () => {
          const id = gradeBtn.dataset.gradeSubmission;
          const marks = Number(drawer.querySelector(`[data-marks-for="${id}"]`).value);
          const feedback = drawer.querySelector(`[data-feedback-for="${id}"]`).value;
          try {
            await api.submissions.grade(id, { marks_obtained: marks, feedback });
            toast('Grade saved');
          } catch (e) { toast(e.message, true); }
        });
      });
    });
  });
}

document.getElementById('form-assignment').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.assignments.create({ ...data, course_id: assignmentsCourseId, max_marks: Number(data.max_marks) });
    toast('Assignment posted');
    form.reset(); form.hidden = true;
    loadAssignments();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// QUIZZES
// ============================================================
document.getElementById('quizzes-course-select').addEventListener('change', (e) => {
  quizzesCourseId = Number(e.target.value);
  loadQuizzes();
});

async function loadQuizzes() {
  if (!quizzesCourseId) return;
  const quizzes = await api.quizzes.byCourse(quizzesCourseId);
  const list = document.getElementById('quizzes-list');
  const empty = document.getElementById('quizzes-empty');
  empty.hidden = quizzes.length > 0;

  let myAttempts = [];
  if (currentUser.role === 'student') {
    myAttempts = await api.quizAttempts.mine();
  }

  list.innerHTML = quizzes.map((q, i) => {
    const attempt = myAttempts.find(a => a.quiz_id === q.id);
    return `
    <div class="item-card" style="animation-delay:${i * 40}ms">
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(q.title)}</h3>
          <div class="item-meta"><span>${q.time_limit_minutes} min</span></div>
        </div>
        ${attempt ? `<span class="badge badge-graded">Score: ${attempt.score}/${attempt.total_marks}</span>` : ''}
        ${isManager() ? `<button class="btn-small danger" data-del-quiz="${q.id}">Remove</button>` : ''}
      </div>
      ${q.description ? `<p class="item-body">${escapeHtml(q.description)}</p>` : ''}
      <div class="item-actions">
        ${currentUser.role === 'student' && !attempt ? `<button class="btn-small" data-take-quiz="${q.id}">Take Quiz</button>` : ''}
        ${isManager() ? `<button class="btn-small outline" data-add-question="${q.id}">+ Add Question</button>
                          <button class="btn-small outline" data-view-attempts="${q.id}">View Attempts</button>` : ''}
      </div>
      <div class="item-drawer" id="drawer-quiz-${q.id}" hidden></div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-del-quiz]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this quiz?')) return;
      try { await api.quizzes.remove(btn.dataset.delQuiz); toast('Quiz removed'); loadQuizzes(); }
      catch (e) { toast(e.message, true); }
    });
  });

  list.querySelectorAll('[data-take-quiz]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const quizId = btn.dataset.takeQuiz;
      const drawer = document.getElementById(`drawer-quiz-${quizId}`);
      drawer.hidden = !drawer.hidden;
      if (drawer.hidden) return;

      const quiz = await api.quizzes.forAttempt(quizId);
      if (!quiz.questions.length) {
        drawer.innerHTML = `<p class="empty-state">This quiz has no questions yet.</p>`;
        return;
      }
      drawer.innerHTML = quiz.questions.map(q => `
        <div class="question-card">
          <p class="question-text">${escapeHtml(q.question_text)}</p>
          ${['a', 'b', 'c', 'd'].map(opt => `
            <label class="option-row">
              <input type="radio" name="q-${q.id}" value="${opt}"> ${escapeHtml(q[`option_${opt}`])}
            </label>`).join('')}
        </div>`).join('') + `<button class="btn-small" id="submit-quiz-${quizId}">Submit Answers</button>`;

      document.getElementById(`submit-quiz-${quizId}`).addEventListener('click', async () => {
        const answers = quiz.questions.map(q => {
          const selected = drawer.querySelector(`input[name="q-${q.id}"]:checked`);
          return selected ? { question_id: q.id, selected_option: selected.value } : null;
        }).filter(Boolean);

        if (answers.length < quiz.questions.length) {
          if (!confirm('Some questions are unanswered. Submit anyway?')) return;
        }
        try {
          const result = await api.quizAttempts.submit({ quiz_id: Number(quizId), answers });
          toast(`Quiz submitted — score: ${result.score}/${result.total_marks}`);
          loadQuizzes();
        } catch (e) { toast(e.message, true); }
      });
    });
  });

  list.querySelectorAll('[data-add-question]').forEach(btn => {
    btn.addEventListener('click', () => {
      const quizId = btn.dataset.addQuestion;
      const drawer = document.getElementById(`drawer-quiz-${quizId}`);
      drawer.hidden = !drawer.hidden;
      if (drawer.hidden) return;

      drawer.innerHTML = `
        <div class="new-question-form">
          <textarea class="full" placeholder="Question text" rows="2" id="nq-text-${quizId}"></textarea>
          <input placeholder="Option A" id="nq-a-${quizId}">
          <input placeholder="Option B" id="nq-b-${quizId}">
          <input placeholder="Option C" id="nq-c-${quizId}">
          <input placeholder="Option D" id="nq-d-${quizId}">
          <select id="nq-correct-${quizId}">
            <option value="a">Correct: A</option><option value="b">Correct: B</option>
            <option value="c">Correct: C</option><option value="d">Correct: D</option>
          </select>
          <input type="number" placeholder="Marks" value="1" id="nq-marks-${quizId}">
          <button class="btn-small full" id="nq-save-${quizId}">Save Question</button>
        </div>`;

      document.getElementById(`nq-save-${quizId}`).addEventListener('click', async () => {
        const data = {
          question_text: document.getElementById(`nq-text-${quizId}`).value.trim(),
          option_a: document.getElementById(`nq-a-${quizId}`).value.trim(),
          option_b: document.getElementById(`nq-b-${quizId}`).value.trim(),
          option_c: document.getElementById(`nq-c-${quizId}`).value.trim(),
          option_d: document.getElementById(`nq-d-${quizId}`).value.trim(),
          correct_option: document.getElementById(`nq-correct-${quizId}`).value,
          marks: Number(document.getElementById(`nq-marks-${quizId}`).value)
        };
        try {
          await api.quizzes.addQuestion(quizId, data);
          toast('Question added');
          drawer.hidden = true;
        } catch (e) { toast(e.message, true); }
      });
    });
  });

  list.querySelectorAll('[data-view-attempts]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const quizId = btn.dataset.viewAttempts;
      const drawer = document.getElementById(`drawer-quiz-${quizId}`);
      drawer.hidden = !drawer.hidden;
      if (drawer.hidden) return;

      const attempts = await api.quizAttempts.byQuiz(quizId);
      drawer.innerHTML = attempts.length
        ? attempts.map(a => `
          <div class="mini-row">
            <span>${escapeHtml(a.student_name)}</span>
            <span class="item-meta">${a.score}/${a.total_marks} — ${fmtDate(a.submitted_at)}</span>
          </div>`).join('')
        : `<p class="empty-state">No attempts yet.</p>`;
    });
  });
}

document.getElementById('form-quiz').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.quizzes.create({ ...data, course_id: quizzesCourseId, time_limit_minutes: Number(data.time_limit_minutes) });
    toast('Quiz created');
    form.reset(); form.hidden = true;
    loadQuizzes();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// ANNOUNCEMENTS
// ============================================================
async function loadAnnouncements() {
  const announcements = await api.announcements.list();
  const list = document.getElementById('announcements-list');
  const empty = document.getElementById('announcements-empty');
  empty.hidden = announcements.length > 0;

  list.innerHTML = announcements.map((a, i) => `
    <div class="item-card" style="animation-delay:${i * 40}ms">
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(a.title)}</h3>
          <div class="item-meta">
            <span>${a.course_name ? escapeHtml(a.course_name) : 'Site-wide'}</span>
            <span>by ${escapeHtml(a.posted_by_name)}</span>
            <span>${fmtDate(a.created_at)}</span>
          </div>
        </div>
        ${isManager() ? `<button class="btn-small danger" data-del-announcement="${a.id}">Remove</button>` : ''}
      </div>
      <p class="item-body">${escapeHtml(a.message)}</p>
    </div>`).join('');

  list.querySelectorAll('[data-del-announcement]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this announcement?')) return;
      try { await api.announcements.remove(btn.dataset.delAnnouncement); toast('Announcement removed'); loadAnnouncements(); }
      catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-announcement').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.announcements.create({
      title: data.title,
      message: data.message,
      course_id: data.course_id ? Number(data.course_id) : null
    });
    toast('Announcement posted');
    form.reset(); form.hidden = true;
    loadAnnouncements();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// Refresh everything (order matters: students & courses fill dropdowns)
// ============================================================
async function refreshAll() {
  try {
    await loadStudents();
    await loadCourses();
    await Promise.all([loadEnrollments(), loadAttendance(), loadGrades(), loadAnnouncements(), loadDashboard()]);
    if (lessonsCourseId) await loadLessons();
    if (assignmentsCourseId) await loadAssignments();
    if (quizzesCourseId) await loadQuizzes();
    if (currentUser.role === 'admin') await loadUsers();
    applyRoleVisibility();
  } catch (e) {
    toast(e.message, true);
  }
}

// ============================================================
// MANAGE USERS (Admin only)
// ============================================================
async function loadUsers() {
  const users = await api.users.list();
  const body = document.getElementById('users-body');
  const empty = document.getElementById('users-empty');
  empty.hidden = users.length > 0;

  body.innerHTML = users.map((u, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td><input class="inline-edit" data-field="name" data-user="${u.id}" value="${escapeHtml(u.name)}"></td>
      <td><input class="inline-edit" data-field="email" data-user="${u.id}" value="${escapeHtml(u.email)}"></td>
      <td>
        <select class="inline-edit" data-field="role" data-user="${u.id}">
          <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
          <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Teacher</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td>${fmtDate(u.created_at)}</td>
      <td style="white-space:nowrap;">
        <button class="btn-icon" data-save-user="${u.id}">Save</button>
        <button class="btn-icon" data-reset-user="${u.id}">Reset PW</button>
        <button class="btn-icon" data-del-user="${u.id}">Remove</button>
      </td>
    </tr>`).join('');

  body.querySelectorAll('[data-save-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.saveUser;
      const row = btn.closest('tr');
      const data = {
        name: row.querySelector(`[data-field="name"][data-user="${id}"]`).value,
        email: row.querySelector(`[data-field="email"][data-user="${id}"]`).value,
        role: row.querySelector(`[data-field="role"][data-user="${id}"]`).value
      };
      try {
        await api.users.update(id, data);
        toast('User updated');
        loadUsers();
      } catch (e) { toast(e.message, true); }
    });
  });

  body.querySelectorAll('[data-reset-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newPassword = prompt('Enter a new password for this user (min 6 characters):');
      if (!newPassword) return;
      try {
        await api.users.resetPassword(btn.dataset.resetUser, newPassword);
        toast('Password reset');
      } catch (e) { toast(e.message, true); }
    });
  });

  body.querySelectorAll('[data-del-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this user permanently?')) return;
      try {
        await api.users.remove(btn.dataset.delUser);
        toast('User removed');
        loadUsers();
      } catch (e) { toast(e.message, true); }
    });
  });
}

document.getElementById('form-user').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await api.users.create(data);
    toast('User created');
    form.reset(); form.hidden = true;
    loadUsers();
  } catch (e) { toast(e.message, true); }
});

// ============================================================
// Scroll-reveal for panel headers/tables (IntersectionObserver)
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ============================================================
// Init
// ============================================================
tryAutoLogin();
setInterval(() => { if (currentUser) checkHealth(); }, 15000);
