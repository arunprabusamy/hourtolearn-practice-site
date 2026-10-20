# HourToLearn Practice Site

A small Node.js/Express web app built for practicing Playwright automation. No frontend
framework, no build step — plain HTML, CSS and vanilla JavaScript served by a single
Express server.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000**.

## Pages

| Page | URL | What it's for |
|---|---|---|
| Home | `/` | Landing page with links to every practice page |
| Forms | `/forms` | Text, email, password, select, textarea, checkboxes, radios, client-side validation |
| Form Layouts | `/form-layouts` | Two independent forms on one page — practice scoping locators to a container |
| Date Picker | `/date-picker` | A native `<input type="date">` and a custom-built date-range calendar widget |
| Dialogs | `/dialogs` | A custom modal, native `alert`/`confirm`/`prompt`, and an auto-dismissing toast |
| Tooltips | `/tooltips` | Hover, focus, and click-triggered tooltips |
| Table | `/table` | Server-backed table with search, sortable columns, row selection, and pagination |
| Drag & Drop | `/drag-drop` | A 3-column kanban board using the HTML5 drag-and-drop API |
| Calendar | `/calendar` | A monthly calendar where you can add and delete events per day |
| Login | `/login` | A real login form backed by the server (see credentials below) |
| Dynamic Content | `/dynamic-content` | Delayed elements, a real network request with a loading state, and a self-removing element |
| File Upload | `/file-upload` | Upload one or more files to the server and see a confirmation |
| Frames & Windows | `/frames-windows` | An iframe, a link that opens a new tab, and a button that opens a popup window |

## Demo login

The Login page is backed by a real server endpoint (not just client-side JS), so it's
useful for practicing authenticated session / `storageState` flows.

- Username: `student`
- Password: `Learn123!`

On success it sets a session cookie and redirects to `/account`, a protected page that
redirects back to `/login` if you're not authenticated.

## Online Store

A second practice environment, linked from the home portal (`/`), that doubles as a realistic
end-to-end shopping flow *and* a deliberately tricky automation gauntlet — one journey
(shop → cart → sign in → checkout → payment → confirmation → account) with hard scenarios
built into each step, rather than a separate grab-bag of demo widgets.

| Page | URL | What's tricky about it |
|---|---|---|
| Shop | `/shop` | A non-native category combobox (ARIA pattern, no `<select>`), a non-native max-price slider, infinite scroll instead of pagination, and a right-click/⋮-button context menu for wishlisting |
| Product Detail | `/shop-product?id=1` | A `<product-reviews>` custom element using **open shadow DOM** — standard CSS/XPath queries won't see inside it |
| Cart | `/cart` | Quantity/remove actions intentionally rebuild every row from scratch — anything holding a reference to an old row is now stale |
| Sign In | `/store-login` | Four persona accounts (see below), modeled after SauceDemo's "broken app" pattern |
| Checkout | `/checkout` | A 3-step wizard (Shipping → Verify → Payment & Review) that survives a mid-flow refresh via `sessionStorage`; a one-time code step; a payment step whose card field lives in a sandboxed iframe (`payment-widget-frame.html`, no `allow-same-origin`) bridged to the parent page via `postMessage` |
| Account | `/store-account` | Order history in a fixed-height scrollable panel (the page itself doesn't scroll to reach it), and a `<canvas>` spending chart paired with a visually-hidden data table so assertions can target data instead of pixels |

Every store page also carries a dismissible cookie-consent banner that overlaps the bottom of
the page until handled — a click-interception scenario, not just UI flavor.

### Demo accounts (password for all: `Shop123!`)

- `shopper` — a normal account
- `locked_shopper` — always locked, even with the right password (403)
- `slow_shopper` — signs in fine, just takes about 4 seconds
- `glitchy_shopper` — signs in fine, but this account's order totals are intentionally
  wrong. Finding the bug by asserting on totals is the exercise — not documented further here.

### Test card numbers (checkout → Payment & Review step)

Sandbox mode, same convention real payment providers (Stripe, PayPal) use for test cards —
no real payment ever occurs:

- `4242 4242 4242 4242` — always succeeds immediately
- `4000 0000 0000 0002` — always declines, no amount of retrying helps
- `4000 0000 0000 9995` — fails twice, then succeeds on the 3rd attempt (for retry/backoff practice)
- Any other 16-digit number — succeeds about 65% of the time, realistic non-deterministic noise

### Verification codes (checkout → Verify step)

After clicking "Send verification code," the current valid code is shown directly on the page
in a labeled sandbox hint — no real SMS/email is sent. The same code is also available via
`GET /api/test/last-otp` for anyone driving the flow purely through API calls.

### Store API endpoints

- `GET /api/products` — supports `q`, `category`, `sortBy`, `sortDir`, `inStockOnly`, `maxPrice`, `page`, `pageSize`
- `GET /api/products/:id`
- `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews`
- `POST /api/store/login`, `GET /api/store/session`, `POST /api/store/logout`
- `POST /api/checkout/send-otp`, `POST /api/checkout/verify-otp`, `GET /api/test/last-otp`
- `POST /api/payment/charge`
- `POST /api/orders` — requires a logged-in session, a verified OTP, and a successful payment
  charge; this is enforced server-side, not just by the checkout UI
- `GET /api/orders` — the signed-in user's order history
- `POST /api/test/reset` — resets the catalog, orders, and reviews back to seed data. Only
  resets server-side state — it can't clear your browser's `localStorage` (cart, wishlist) or
  `sessionStorage` (in-progress checkout step). Use an incognito window for a fully clean run.

## API endpoints used by the pages

These are real endpoints (not mocked), useful for network interception / mocking exercises:

- `GET /api/users` — supports `q`, `sortBy`, `sortDir`, `page`, `pageSize` query params
- `GET /api/items?delay=800` — returns data after an artificial delay
- `POST /login` — `{ username, password }`
- `GET /api/session` — current login state
- `POST /logout`
- `POST /upload` — multipart form upload, field name `files`

## Locators

Every interactive element has either a proper `<label for>` / accessible role, or a
`data-testid` attribute (often both). IDs are static and never randomly generated, so
locators written against this site will stay stable across runs.
