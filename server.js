const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ---------------------------------------------------------------------------
// In-memory demo data
// ---------------------------------------------------------------------------

const ROLES = ['Admin', 'Editor', 'Viewer'];
const FIRST_NAMES = ['Ava', 'Liam', 'Noah', 'Mia', 'Ivy', 'Kai', 'Zoe', 'Leo', 'Nora', 'Eli', 'Luna', 'Max', 'Ella', 'Finn', 'Ruby', 'Sam', 'Tara', 'Owen', 'Nina', 'Jude', 'Vera', 'Cole', 'Isla'];
const LAST_NAMES = ['Reed', 'Foster', 'Blake', 'Hayes', 'Cross', 'Wells', 'Frost', 'Vance', 'Shaw', 'Lane', 'Pratt', 'Doyle', 'Marsh', 'Quinn', 'Rowe', 'Stone', 'Todd', 'Voss', 'Webb', 'York', 'Zane', 'Ashe', 'Bond'];

const users = FIRST_NAMES.map((first, i) => {
  const last = LAST_NAMES[i];
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@hourtolearn.dev`,
    role: ROLES[i % ROLES.length],
    age: 22 + (i % 30)
  };
});

const items = [
  { id: 1, title: 'Set up a Playwright project' },
  { id: 2, title: 'Write your first locator' },
  { id: 3, title: 'Handle an async API response' },
  { id: 4, title: 'Mock a network request' },
  { id: 5, title: 'Reuse an authenticated session' },
  { id: 6, title: 'Upload and verify a file' }
];

const DEMO_USERNAME = 'student';
const DEMO_PASSWORD = 'Learn123!';
const SESSION_COOKIE = 'pw_session';
const SESSION_TOKEN = 'valid-demo-token';

// ---------------------------------------------------------------------------
// API: users table (search, sort, pagination)
// ---------------------------------------------------------------------------

app.get('/api/users', (req, res) => {
  const { q = '', sortBy = 'name', sortDir = 'asc', page = '1', pageSize = '5' } = req.query;

  let result = users.filter((u) => {
    const haystack = `${u.name} ${u.email} ${u.role}`.toLowerCase();
    return haystack.includes(String(q).toLowerCase());
  });

  const validSortKeys = ['name', 'email', 'role', 'age'];
  const key = validSortKeys.includes(sortBy) ? sortBy : 'name';
  const dir = sortDir === 'desc' ? -1 : 1;

  result = result.slice().sort((a, b) => {
    if (a[key] < b[key]) return -1 * dir;
    if (a[key] > b[key]) return 1 * dir;
    return 0;
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 5);
  const total = result.length;
  const start = (pageNum - 1) * size;
  const data = result.slice(start, start + size);

  res.json({ data, total, page: pageNum, pageSize: size });
});

// ---------------------------------------------------------------------------
// API: items with artificial delay (dynamic content practice)
// ---------------------------------------------------------------------------

app.get('/api/items', (req, res) => {
  const delay = Math.min(5000, Math.max(0, parseInt(req.query.delay, 10) || 800));
  setTimeout(() => res.json({ items }), delay);
});

// ---------------------------------------------------------------------------
// API: login / session / logout
// ---------------------------------------------------------------------------

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    res.cookie(SESSION_COOKIE, SESSION_TOKEN, { httpOnly: true, sameSite: 'lax' });
    return res.status(200).json({ message: 'Login successful' });
  }

  res.status(401).json({ message: 'Invalid username or password' });
});

app.get('/api/session', (req, res) => {
  const loggedIn = req.cookies[SESSION_COOKIE] === SESSION_TOKEN;
  res.json({ loggedIn, user: loggedIn ? DEMO_USERNAME : null });
});

app.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------------
// API: file upload
// ---------------------------------------------------------------------------

app.post('/upload', upload.array('files'), (req, res) => {
  const files = (req.files || []).map((f) => ({ filename: f.originalname, size: f.size }));
  res.json({ files });
});

app.listen(PORT, () => {
  console.log(`HourToLearn Practice Site running at http://localhost:${PORT}`);
});
