# Dr Mom 2.0 — Admin Panel

Internal admin panel for managing the **Dr Mom 2.0** learning platform. Allows administrators to manage the full course catalogue, users, enrollments, pricing, and video uploads directly to Bunny CDN.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router DOM 6 |
| Auth | httpOnly cookie sessions (managed by backend) |
| Video upload | TUS protocol — browser uploads directly to Bunny CDN (zero server bandwidth) |
| Icons | Lucide React |
| Deployment | Nginx in Docker |

---

## Pages

| Route | Description |
|---|---|
| `/login` | Admin login |
| `/` | Dashboard — live stats (users, courses, orders, enrollments) |
| `/classes` | Manage class levels |
| `/subjects` | Manage subjects per class |
| `/chapters` | Manage chapters per course |
| `/courses` | Manage courses (create, edit, publish/unpublish, delete) |
| `/videos` | Lesson Master — create/edit lessons, upload videos to Bunny CDN |
| `/products` | Product Master — course descriptions and metadata |
| `/pricing` | Pricing per plan, reset/delete pricing entries |
| `/users` | User management — view, create, edit, deactivate, delete |
| `/orders` | Order history and payment records |
| `/enrollments` | Manual enrollment management (grant/revoke access) |

---

## Setup

### Prerequisites
- Node.js 18+
- Backend API running (see `drmombackend`)

### Local development

```bash
npm install
```

Create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:28100/api
```

```bash
npm run dev
# Opens at http://localhost:5173
```

### Production build

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api npm run build
```

### Docker (production)

```bash
docker build -t drmom-admin .
docker run -d --name drmom-admin -p 80:80 drmom-admin
```

---

## Project Structure

```
src/
├── components/
│   ├── AdminProfile.jsx    # Topbar profile dropdown
│   └── Sidebar.jsx         # Navigation sidebar
├── pages/
│   ├── Login.jsx           # Admin login page
│   ├── Dashboard.jsx       # Stats overview
│   ├── Classes.jsx         # Class CRUD
│   ├── Subjects.jsx        # Subject CRUD
│   ├── Chapters.jsx        # Chapter CRUD
│   ├── Courses.jsx         # Course CRUD + publish/unpublish
│   ├── Lesson.jsx          # Lesson CRUD + Bunny CDN video upload
│   ├── ProductMaster.jsx   # Course metadata management
│   ├── Prices.jsx          # Pricing management
│   ├── Users.jsx           # User management
│   ├── Orders.jsx          # Order/payment history
│   └── Enrollments.jsx     # Manual enrollment management
├── utils/
│   ├── api.js              # Fetch wrapper with httpOnly cookie auth + token refresh
│   └── adminData.js        # Helpers for building catalog dropdowns
└── App.jsx                 # Routes with ProtectedRoute guard
```

---

## Video Upload Flow (Direct to Bunny CDN)

The Lesson Master page supports uploading videos directly to Bunny CDN — **the video file never passes through the server** (zero inbound/outbound VM bandwidth):

1. Admin selects a video file → panel calls `POST /api/admin/bunny/videos/init`
2. Backend creates a video entry in Bunny Stream, returns TUS credentials (time-limited, 1-hour window)
3. Browser uploads directly to `https://video.bunnycdn.com/tusupload` using TUS protocol (`tus-js-client`)
4. Panel polls `GET /api/admin/bunny/videos/:guid/status` until encoding completes
5. Bunny Video ID and embed URL are auto-filled into the lesson form
6. Admin saves the lesson — the video is now linked and gated by course access

---

## Access Control

The admin panel requires a backend `ADMIN` role. All API calls go to `/api/admin/*` which enforces `requireAuth + requireAdmin` on every route server-side. The frontend `ProtectedRoute` is a UI convenience only — the backend is the real gate.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourdomain.com/api` |

---

## Deployment Checklist

- [ ] Set `VITE_API_BASE_URL` to real domain before `npm run build`
- [ ] Keep the admin panel URL private (not linked from public site)
- [ ] Change default admin password on first login
- [ ] Backend `COOKIE_SECURE=true` required for cookies to work over HTTPS
- [ ] Backend `CORS_ORIGIN` must include the admin panel's domain
