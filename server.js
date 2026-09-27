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
    const valA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
    const valB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 5);
  const total = result.length;
  const start = (pageNum - 1) * size;
  const data = result.slice(start, start + size);

  res.json({ data, total, page: pageNum, pageSize: size });
});

app.post('/api/users', (req, res) => {
  const { name, email, role, age } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  const newUser = {
    id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
    name,
    email,
    role: ROLES.includes(role) ? role : 'Viewer',
    age: Number.isInteger(age) ? age : 25
  };

  users.push(newUser);
  res.status(201).json(newUser);
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

// ---------------------------------------------------------------------------
// In-memory demo data: online purchase flow
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES = ['Electronics', 'Home & Kitchen', 'Fitness & Outdoors'];

const products = [
  { id: 1, name: 'Wireless Earbuds Pro', category: 'Electronics', price: 79.99, description: 'Noise-cancelling true wireless earbuds with 24-hour battery case.', emoji: '🎧', imageBg: '#e0e7ff', inStock: true, rating: 4.5 },
  { id: 2, name: 'Smart Fitness Watch', category: 'Electronics', price: 129.99, description: 'Tracks heart rate, sleep and workouts with a 7-day battery.', emoji: '⌚', imageBg: '#dbeafe', inStock: true, rating: 4.2 },
  { id: 3, name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 49.99, description: 'Compact speaker with deep bass and IPX7 water resistance.', emoji: '🔊', imageBg: '#e0f2fe', inStock: true, rating: 4.0 },
  { id: 4, name: '4K Action Camera', category: 'Electronics', price: 199.99, description: 'Waterproof action camera with image stabilization.', emoji: '📷', imageBg: '#ede9fe', inStock: false, rating: 4.6 },
  { id: 5, name: 'Stainless Steel Pour-Over Coffee Maker', category: 'Home & Kitchen', price: 34.99, description: 'Double-walled steel carafe for smooth, sediment-free coffee.', emoji: '☕', imageBg: '#fef3c7', inStock: true, rating: 4.3 },
  { id: 6, name: 'Ceramic Non-Stick Frying Pan Set', category: 'Home & Kitchen', price: 59.99, description: 'Three-piece scratch-resistant non-stick pan set.', emoji: '🍳', imageBg: '#fee2e2', inStock: true, rating: 4.1 },
  { id: 7, name: 'Robotic Vacuum Cleaner', category: 'Home & Kitchen', price: 249.99, description: 'Self-charging robot vacuum with app scheduling.', emoji: '🤖', imageBg: '#e5e7eb', inStock: true, rating: 4.4 },
  { id: 8, name: 'Aromatherapy Essential Oil Diffuser', category: 'Home & Kitchen', price: 27.99, description: 'Ultrasonic diffuser with color-changing LED light.', emoji: '🌿', imageBg: '#dcfce7', inStock: false, rating: 3.9 },
  { id: 9, name: 'Adjustable Dumbbell Set', category: 'Fitness & Outdoors', price: 89.99, description: 'Space-saving dumbbells adjustable from 5 to 25 lbs.', emoji: '🏋️', imageBg: '#fae8ff', inStock: true, rating: 4.7 },
  { id: 10, name: 'Insulated Stainless Steel Water Bottle', category: 'Fitness & Outdoors', price: 19.99, description: 'Keeps drinks cold for 24 hours or hot for 12.', emoji: '🚰', imageBg: '#cffafe', inStock: true, rating: 4.8 },
  { id: 11, name: '2-Person Camping Tent', category: 'Fitness & Outdoors', price: 149.99, description: 'Lightweight, weatherproof tent with quick setup.', emoji: '⛺', imageBg: '#d9f99d', inStock: true, rating: 4.2 }
];

const orders = [];

// NOTE: kept in sync by hand with the equivalent constants in public/js/checkout.js
const TAX_RATE = 0.08;
const SHIPPING_FLAT_RATE = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;
const ORDER_PROCESSING_DELAY_MS = 500;

function round2(value) {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// API: products (search, filter, sort, pagination)
// ---------------------------------------------------------------------------

app.get('/api/products', (req, res) => {
  const { q = '', category = 'all', sortBy = 'name', sortDir = 'asc', inStockOnly, page = '1', pageSize = '12' } = req.query;

  let result = products.filter((p) => {
    const haystack = `${p.name} ${p.description} ${p.category}`.toLowerCase();
    return haystack.includes(String(q).toLowerCase());
  });

  if (category !== 'all') {
    result = result.filter((p) => p.category === category);
  }

  if (inStockOnly === 'true') {
    result = result.filter((p) => p.inStock);
  }

  const validSortKeys = ['name', 'price', 'rating'];
  const key = validSortKeys.includes(sortBy) ? sortBy : 'name';
  const dir = sortDir === 'desc' ? -1 : 1;

  result = result.slice().sort((a, b) => {
    const valA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
    const valB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 12);
  const total = result.length;
  const start = (pageNum - 1) * size;
  const data = result.slice(start, start + size);

  res.json({ data, total, page: pageNum, pageSize: size });
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

// ---------------------------------------------------------------------------
// API: orders (server-authoritative pricing)
// ---------------------------------------------------------------------------

app.post('/api/orders', (req, res) => {
  const { items, shipping } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const resolvedItems = [];
  const invalidProductIds = [];

  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    const quantity = Number.isInteger(item.quantity) ? item.quantity : NaN;
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      invalidProductIds.push(item.productId);
      return;
    }
    resolvedItems.push({ product, quantity });
  });

  if (invalidProductIds.length > 0) {
    return res.status(400).json({
      message: 'One or more items in your cart are invalid',
      invalidProductIds
    });
  }

  const outOfStock = resolvedItems.filter((ri) => !ri.product.inStock);
  if (outOfStock.length > 0) {
    return res.status(400).json({
      message: `"${outOfStock[0].product.name}" is no longer in stock`,
      outOfStockProductIds: outOfStock.map((ri) => ri.product.id)
    });
  }

  const requiredShippingFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
  const missingFields = requiredShippingFields.filter(
    (field) => !shipping || typeof shipping[field] !== 'string' || shipping[field].trim() === ''
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Shipping address is incomplete',
      missingFields
    });
  }

  const orderItems = resolvedItems.map(({ product, quantity }) => {
    const unitPrice = product.price;
    const lineTotal = round2(unitPrice * quantity);
    return { productId: product.id, name: product.name, unitPrice, quantity, lineTotal };
  });

  const subtotal = round2(orderItems.reduce((sum, i) => sum + i.lineTotal, 0));
  const tax = round2(subtotal * TAX_RATE);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const total = round2(subtotal + tax + shippingFee);

  const orderId = orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
  const orderNumber = 'ORD-' + (10000 + orderId);
  const createdAt = new Date().toISOString();

  const order = {
    id: orderId,
    orderNumber,
    items: orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    shippingAddress: shipping,
    createdAt
  };

  orders.push(order);

  setTimeout(() => {
    res.status(201).json({
      orderId,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      shippingFee,
      total,
      shippingAddress: shipping,
      createdAt
    });
  }, ORDER_PROCESSING_DELAY_MS);
});

app.listen(PORT, () => {
  console.log(`HourToLearn Practice Site running at http://localhost:${PORT}`);
});
