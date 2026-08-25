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
