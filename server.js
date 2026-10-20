const path = require('path');
const crypto = require('crypto');
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
  { id: 11, name: '2-Person Camping Tent', category: 'Fitness & Outdoors', price: 149.99, description: 'Lightweight, weatherproof tent with quick setup.', emoji: '⛺', imageBg: '#d9f99d', inStock: true, rating: 4.2 },
  { id: 12, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, description: 'Tactile RGB mechanical keyboard with hot-swappable switches.', emoji: '⌨️', imageBg: '#e0e7ff', inStock: true, rating: 4.3 },
  { id: 13, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, description: 'Ergonomic wireless mouse with silent clicks.', emoji: '🖱️', imageBg: '#dbeafe', inStock: true, rating: 4.1 },
  { id: 14, name: 'Portable Power Bank', category: 'Electronics', price: 39.99, description: '20,000mAh fast-charging power bank with USB-C.', emoji: '🔋', imageBg: '#e0f2fe', inStock: true, rating: 4.4 },
  { id: 15, name: 'Smart LED Desk Lamp', category: 'Electronics', price: 44.99, description: 'Adjustable brightness and color temperature desk lamp.', emoji: '💡', imageBg: '#ede9fe', inStock: true, rating: 4.0 },
  { id: 16, name: 'Electric Kettle', category: 'Home & Kitchen', price: 32.99, description: 'Rapid-boil electric kettle with auto shut-off.', emoji: '🫖', imageBg: '#fef3c7', inStock: true, rating: 4.5 },
  { id: 17, name: 'Bamboo Cutting Board Set', category: 'Home & Kitchen', price: 24.99, description: 'Three-piece eco-friendly bamboo cutting boards.', emoji: '🪵', imageBg: '#fee2e2', inStock: true, rating: 4.2 },
  { id: 18, name: 'Scented Soy Candle Trio', category: 'Home & Kitchen', price: 22.99, description: 'Hand-poured soy candles in three relaxing scents.', emoji: '🕯️', imageBg: '#dcfce7', inStock: false, rating: 4.6 },
  { id: 19, name: 'Memory Foam Pillow', category: 'Home & Kitchen', price: 29.99, description: 'Contoured memory foam pillow for neck support.', emoji: '🛏️', imageBg: '#e5e7eb', inStock: true, rating: 4.3 },
  { id: 20, name: 'Yoga Mat', category: 'Fitness & Outdoors', price: 24.99, description: 'Non-slip extra-thick yoga mat with carry strap.', emoji: '🧘', imageBg: '#fae8ff', inStock: true, rating: 4.7 },
  { id: 21, name: 'Hiking Backpack', category: 'Fitness & Outdoors', price: 69.99, description: '30L water-resistant backpack for day hikes.', emoji: '🎒', imageBg: '#cffafe', inStock: true, rating: 4.5 },
  { id: 22, name: 'Resistance Bands Set', category: 'Fitness & Outdoors', price: 18.99, description: 'Five-level resistance bands for strength training.', emoji: '🏋️‍♀️', imageBg: '#d9f99d', inStock: true, rating: 4.4 },
  { id: 23, name: 'Foldable Camping Chair', category: 'Fitness & Outdoors', price: 34.99, description: 'Lightweight foldable chair with cup holder.', emoji: '🪑', imageBg: '#fde68a', inStock: true, rating: 4.1 },
  { id: 24, name: 'LED Headlamp', category: 'Fitness & Outdoors', price: 16.99, description: 'Rechargeable headlamp with 3 brightness modes.', emoji: '🔦', imageBg: '#bae6fd', inStock: true, rating: 4.6 }
];

const SEED_PRODUCTS = products.map((p) => ({ ...p }));

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
  const { q = '', category = 'all', sortBy = 'name', sortDir = 'asc', inStockOnly, maxPrice, page = '1', pageSize = '12' } = req.query;

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

  if (maxPrice !== undefined && maxPrice !== '') {
    const maxPriceNum = parseFloat(maxPrice);
    if (!Number.isNaN(maxPriceNum)) {
      result = result.filter((p) => p.price <= maxPriceNum);
    }
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
  // Enforced server-side, not just by the checkout UI: a direct POST without a logged-in
  // session, a verified OTP, and a successful payment charge is rejected here. This is what
  // actually proves the login -> verify -> pay steps matter, instead of being skippable.
  const session = getStoreSession(req);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to place an order.' });
  }
  if (!session.otpVerified) {
    return res.status(403).json({ message: 'Please verify your identity before placing an order.' });
  }
  if (!session.paymentToken) {
    return res.status(402).json({ message: 'Payment is required before placing an order.' });
  }

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
  let tax = round2(subtotal * TAX_RATE);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  let total = round2(subtotal + tax + shippingFee);

  const persona = STORE_PERSONAS[session.username];
  if (persona && persona.kind === 'glitchy') {
    // Intentional bug for the "glitchy_shopper" persona: tax is double-counted. Not
    // documented for end users — finding it by asserting on totals is the exercise.
    tax = round2(tax * 2);
    total = round2(subtotal + tax + shippingFee);
  }

  const orderId = orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
  const orderNumber = 'ORD-' + (10000 + orderId);
  const createdAt = new Date().toISOString();

  const order = {
    id: orderId,
    orderNumber,
    username: session.username,
    items: orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    shippingAddress: shipping,
    createdAt
  };

  // Consume the payment token now, at the point of no return — a retried/duplicate
  // request after this can't re-use it to place a second order for the same payment.
  session.paymentToken = null;
  session.otpVerified = false;

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

// ---------------------------------------------------------------------------
// API: product reviews (Shadow DOM widget on the product detail page)
// ---------------------------------------------------------------------------

const reviews = {
  1: [
    { id: 1, author: 'Jordan P.', rating: 5, comment: 'Great sound and battery life!', createdAt: '2026-07-02T10:00:00.000Z' },
    { id: 2, author: 'Sam K.', rating: 4, comment: 'Comfortable fit, wish the case was smaller.', createdAt: '2026-08-14T15:30:00.000Z' }
  ]
};

const SEED_REVIEWS = JSON.parse(JSON.stringify(reviews));

app.get('/api/products/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json({ reviews: reviews[id] || [] });
});

app.post('/api/products/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { author, rating, comment } = req.body || {};
  const ratingNum = Number(rating);

  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
  }
  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ message: 'A comment is required.' });
  }

  if (!reviews[id]) reviews[id] = [];
  const newReview = {
    id: reviews[id].reduce((max, r) => Math.max(max, r.id), 0) + 1,
    author: author.trim(),
    rating: ratingNum,
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };
  reviews[id].push(newReview);
  res.status(201).json(newReview);
});

// ---------------------------------------------------------------------------
// API: store auth — persona-based login (SauceDemo-style "broken app" accounts)
// ---------------------------------------------------------------------------

const STORE_SESSION_COOKIE = 'store_session';

const STORE_PERSONAS = {
  shopper: { password: 'Shop123!', kind: 'normal' },
  locked_shopper: { password: 'Shop123!', kind: 'locked' },
  slow_shopper: { password: 'Shop123!', kind: 'slow' },
  glitchy_shopper: { password: 'Shop123!', kind: 'glitchy' }
};

// token -> { username, otpCode, otpVerified, paymentAttemptCount, paymentToken }
const storeSessions = new Map();

function getStoreSession(req) {
  const token = req.cookies[STORE_SESSION_COOKIE];
  return token ? storeSessions.get(token) : undefined;
}

app.post('/api/store/login', (req, res) => {
  const { username, password } = req.body || {};
  const persona = STORE_PERSONAS[username];

  if (!persona || persona.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  if (persona.kind === 'locked') {
    return res.status(403).json({ message: 'This account has been locked. Contact support.' });
  }

  const completeLogin = () => {
    const token = crypto.randomBytes(16).toString('hex');
    storeSessions.set(token, {
      username,
      otpCode: null,
      otpVerified: false,
      paymentAttemptCount: 0,
      paymentToken: null
    });
    res.cookie(STORE_SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({ message: 'Login successful', username });
  };

  if (persona.kind === 'slow') {
    setTimeout(completeLogin, 4000);
  } else {
    completeLogin();
  }
});

app.get('/api/store/session', (req, res) => {
  const session = getStoreSession(req);
  res.json({ loggedIn: Boolean(session), username: session ? session.username : null });
});

app.post('/api/store/logout', (req, res) => {
  const token = req.cookies[STORE_SESSION_COOKIE];
  if (token) storeSessions.delete(token);
  res.clearCookie(STORE_SESSION_COOKIE);
  res.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------------
// API: checkout OTP verification
// ---------------------------------------------------------------------------

app.post('/api/checkout/send-otp', (req, res) => {
  const session = getStoreSession(req);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to verify your identity.' });
  }

  session.otpCode = String(Math.floor(100000 + Math.random() * 900000));
  session.otpVerified = false;
  // Starting a fresh checkout attempt also resets the payment-retry counter below.
  session.paymentAttemptCount = 0;
  session.paymentToken = null;

  // Returned directly in the response (sandbox mode) so a human running this locally can
  // complete the flow without hitting /api/test/last-otp. See GET /api/test/last-otp for
  // the pure-API equivalent.
  res.json({ message: 'Verification code sent.', code: session.otpCode });
});

app.post('/api/checkout/verify-otp', (req, res) => {
  const session = getStoreSession(req);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to verify your identity.' });
  }
  if (!session.otpCode) {
    return res.status(400).json({ message: 'Request a verification code first.' });
  }

  const { code } = req.body || {};
  if (code !== session.otpCode) {
    return res.status(400).json({ message: 'Incorrect verification code.' });
  }

  session.otpVerified = true;
  res.json({ verified: true });
});

app.get('/api/test/last-otp', (req, res) => {
  const session = getStoreSession(req);
  if (!session || !session.otpCode) {
    return res.status(404).json({ message: 'No verification code has been sent for this session.' });
  }
  res.json({ code: session.otpCode });
});

// ---------------------------------------------------------------------------
// API: payment — magic test card numbers (same convention as Stripe/PayPal sandboxes)
// ---------------------------------------------------------------------------

const PAYMENT_ALWAYS_SUCCEED_CARD = '4242424242424242';
const PAYMENT_ALWAYS_DECLINE_CARD = '4000000000000002';
const PAYMENT_DECLINE_TWICE_CARD = '4000000000009995';
const PAYMENT_RETRY_THRESHOLD = 2; // first 2 attempts on the decline-twice card fail, the 3rd succeeds

app.post('/api/payment/charge', (req, res) => {
  const session = getStoreSession(req);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to pay.' });
  }
  if (!session.otpVerified) {
    return res.status(403).json({ message: 'Please verify your identity before paying.' });
  }

  const cardNumber = String((req.body && req.body.cardNumber) || '').replace(/\s+/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    return res.status(400).json({ message: 'Enter a valid 16-digit card number.' });
  }

  if (cardNumber === PAYMENT_ALWAYS_DECLINE_CARD) {
    return res.status(402).json({ message: 'Card declined. Try a different card.' });
  }

  if (cardNumber === PAYMENT_DECLINE_TWICE_CARD) {
    session.paymentAttemptCount += 1;
    if (session.paymentAttemptCount <= PAYMENT_RETRY_THRESHOLD) {
      res.set('Retry-After', '2');
      return res.status(503).json({ message: 'Payment processor temporarily unavailable. Please retry.' });
    }
    // 3rd+ attempt on this card succeeds below.
  } else if (cardNumber !== PAYMENT_ALWAYS_SUCCEED_CARD) {
    // Any other 16-digit card: ~35% random failure — realistic noise, non-deterministic on purpose.
    if (Math.random() < 0.35) {
      return res.status(503).json({ message: 'Payment processor error. Please retry.' });
    }
  }

  session.paymentToken = crypto.randomBytes(12).toString('hex');
  res.json({ success: true, paymentToken: session.paymentToken, last4: cardNumber.slice(-4) });
});

// ---------------------------------------------------------------------------
// API: order history (Account page)
// ---------------------------------------------------------------------------

app.get('/api/orders', (req, res) => {
  const session = getStoreSession(req);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to view order history.' });
  }

  const myOrders = orders
    .filter((o) => o.username === session.username)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ data: myOrders });
});

// ---------------------------------------------------------------------------
// Seed order history per persona, for the Account page's order list + spending chart
// ---------------------------------------------------------------------------

function buildSeedOrders() {
  const usernames = ['shopper', 'slow_shopper', 'glitchy_shopper'];
  const seedOrders = [];
  let seedId = 1;

  usernames.forEach((username) => {
    for (let i = 0; i < 12; i += 1) {
      const monthsAgo = i % 6;
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(1 + ((i * 7) % 25));

      const product = products[(i * 3 + username.length) % products.length];
      const quantity = 1 + (i % 3);
      const unitPrice = product.price;
      const lineTotal = round2(unitPrice * quantity);
      const subtotal = lineTotal;
      const tax = round2(subtotal * TAX_RATE);
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
      const total = round2(subtotal + tax + shippingFee);

      seedOrders.push({
        id: seedId,
        orderNumber: 'ORD-' + (10000 + seedId),
        username,
        items: [{ productId: product.id, name: product.name, unitPrice, quantity, lineTotal }],
        subtotal,
        tax,
        shippingFee,
        total,
        shippingAddress: {
          fullName: username,
          addressLine1: '123 Practice St',
          addressLine2: '',
          city: 'Sampleton',
          state: 'CA',
          postalCode: '90001',
          country: 'United States'
        },
        createdAt: date.toISOString()
      });
      seedId += 1;
    }
  });

  return seedOrders;
}

orders.push(...buildSeedOrders());

const SEED_ORDERS = orders.map((o) => ({
  ...o,
  items: o.items.map((it) => ({ ...it })),
  shippingAddress: { ...o.shippingAddress }
}));

// ---------------------------------------------------------------------------
// API: test-only reset — lets automation suites get a clean slate between runs.
// Resets server in-memory state only; it cannot clear browser localStorage (cart,
// wishlist) or sessionStorage (in-progress checkout step) — use an incognito window
// for a fully clean manual run.
// ---------------------------------------------------------------------------

app.post('/api/test/reset', (req, res) => {
  products.length = 0;
  products.push(...SEED_PRODUCTS.map((p) => ({ ...p })));

  orders.length = 0;
  orders.push(
    ...SEED_ORDERS.map((o) => ({
      ...o,
      items: o.items.map((it) => ({ ...it })),
      shippingAddress: { ...o.shippingAddress }
    }))
  );

  Object.keys(reviews).forEach((key) => delete reviews[key]);
  Object.assign(reviews, JSON.parse(JSON.stringify(SEED_REVIEWS)));

  storeSessions.clear();
  res.clearCookie(STORE_SESSION_COOKIE);

  res.json({ message: 'Store data reset to seed state.' });
});

app.listen(PORT, () => {
  console.log(`HourToLearn Practice Site running at http://localhost:${PORT}`);
});
