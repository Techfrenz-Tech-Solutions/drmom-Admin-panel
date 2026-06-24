# Dr Mom 2.0 — Admin Panel

A complete admin panel built with **React + Vite** for managing the Dr Mom 2.0 learning platform.

## Features

- **Dashboard** — Overview stats for users, videos, chapters, and pricing
- **Classes** — View all class levels (LKG, UKG, 1st–5th) with stats
- **Subjects** — View all subjects with chapter & video counts
- **Chapters** — Add, edit, delete chapters with class & subject filters
- **Lesson Videos** — Add, edit, delete videos; mark free vs premium; link to chapters
- **Pricing** — Manage subscription plans per class (Monthly, Quarterly, Yearly, etc.)
- **Users** — Full user management with status toggles, filters, and search

## Setup

1. **Install dependencies**
   ```bash
   cd drmom-admin
   npm install
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

3. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
drmom-admin/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx / Sidebar.css
│   │   ├── Topbar.jsx / Topbar.css
│   │   └── Modal.jsx
│   ├── context/
│   │   └── AppContext.jsx       ← all data state
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Classes.jsx
│   │   ├── Subjects.jsx
│   │   ├── Chapters.jsx
│   │   ├── Videos.jsx
│   │   ├── Prices.jsx
│   │   └── Users.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Connecting to a Backend

Currently uses in-memory state. To connect to a real API:

1. Replace state management in `src/context/AppContext.jsx`
2. Replace `useState` with `useEffect` + API calls (REST or Firebase/Supabase)
3. Example: replace `addChapter` with a `POST /api/chapters` call

## Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- Lucide React (icons)
- Google Fonts: Syne + DM Sans
