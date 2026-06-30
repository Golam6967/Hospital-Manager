# Hospital Manager — Project Overview

Bangladesh Hospital Management System. A full-stack web app for managing hospital records, filtering by location/type, viewing statistics, and running emergency care searches ranked by doctor quality score.

---

## Table of Contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [Backend](#backend)
  - [Running the Server](#running-the-server)
  - [Environment Variables](#environment-variables)
  - [Database Models](#database-models)
  - [API Endpoints](#api-endpoints)
  - [Middleware](#middleware)
- [Frontend](#frontend)
  - [Running the App](#running-the-app)
  - [Components](#components)
  - [API Service Layer](#api-service-layer)
  - [State Management](#state-management)
  - [Design System](#design-system)

---

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, plain CSS         |
| Backend   | Node.js, Express 4                |
| Database  | MongoDB with Mongoose ODM         |
| Auth      | JWT (access + refresh tokens)     |
| Maps      | OpenStreetMap + Nominatim geocode |

---

## Project Structure

```
Hospital-Manager/
├── backend/
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # Auth, error handling, DB connect
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── utils/             # Helpers
│   └── server.js          # Entry point
└── frontend/
    └── src/
        ├── components/    # React UI components
        ├── services/      # API service layer (api.js)
        ├── App.jsx        # Root component + tab routing
        └── index.css      # Global styles + CSS variables
```

---

## Backend

### Running the Server

```bash
cd backend
npm install

npm run dev     # development (nodemon, auto-reload)
npm start       # production (node)
npm run import  # import hospitals from CSV
```

Default port: **5000**

---

### Environment Variables

Create a `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/hospital-manager
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

| Variable                | Purpose                              |
|-------------------------|--------------------------------------|
| `MONGODB_URI`           | MongoDB connection string            |
| `PORT`                  | Server port (default 5000)           |
| `JWT_SECRET`            | Signs JWT access tokens              |
| `CORS_ORIGIN`           | Allowed frontend origin              |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase admin SDK config (optional) |
| `GROQ_API_KEY`          | AI features (optional)               |

---

### Database Models

#### Hospital

| Field            | Type    | Notes                         |
|------------------|---------|-------------------------------|
| `name`           | String  | Required, indexed             |
| `nameBangla`     | String  | Optional                      |
| `code`           | Number  | Required, unique              |
| `email`          | String  | Optional                      |
| `type`           | String  | e.g. "General", indexed       |
| `agency`         | String  | Governing agency, indexed     |
| `division`       | String  | Administrative division       |
| `district`       | String  | District, indexed             |
| `upazila`        | String  | Sub-district, indexed         |
| `cityCorporation`| String  | Optional                      |
| `paurasava`      | String  | Optional                      |
| `union`          | String  | Optional                      |
| `private`        | Boolean | Default: `false`              |
| `score`          | Number  | Quality score 0–100, default 50 |
| `createdAt`      | Date    | Auto (timestamps)             |
| `updatedAt`      | Date    | Auto (timestamps)             |

#### User

| Field            | Type    | Notes                                              |
|------------------|---------|----------------------------------------------------|
| `firstName`      | String  | Required                                           |
| `lastName`       | String  | Required                                           |
| `email`          | String  | Required, unique                                   |
| `password`       | String  | Hashed with bcrypt (min 6 chars)                   |
| `role`           | String  | `admin` \| `staff` \| `doctor` \| `manager` \| `user` |
| `phone`          | String  | Optional                                           |
| `department`     | String  | Optional                                           |
| `hospitalId`     | ObjectId| Ref → Hospital                                     |
| `isActive`       | Boolean | Default: `true`                                    |
| `refreshTokens`  | Array   | `{ token, createdAt }` — expires 7 days            |
| `lastLogin`      | Date    | Set on each login                                  |
| `permissions`    | Array   | String permission list                             |

---

### API Endpoints

**Base URL:** `http://localhost:5000`

#### Hospitals — `/api/hospitals`

| Method | Path                      | Auth | Description                                 |
|--------|---------------------------|------|---------------------------------------------|
| GET    | `/`                       | No   | List all hospitals (paginated)              |
| GET    | `/:id`                    | No   | Get single hospital by ID                   |
| GET    | `/filter/advanced`        | No   | Filter by division, district, type, name…   |
| GET    | `/distinct/:field`        | No   | Unique values for a field (for dropdowns)   |
| GET    | `/stats`                  | No   | Aggregate counts by type, division, etc.    |
| GET    | `/emergency`              | No   | Top 30 hospitals sorted by quality score    |
| GET    | `/docs`                   | No   | API documentation                           |
| POST   | `/`                       | No   | Create new hospital                         |
| PUT    | `/:id`                    | No   | Update hospital                             |
| DELETE | `/:id`                    | No   | Delete single hospital                      |
| DELETE | `/delete/by-filter`       | No   | Bulk delete by filter criteria              |
| DELETE | `/delete-all`             | No   | Delete all (`?confirm=yes-delete-all`)      |

**Filter query params:** `division`, `district`, `upazila`, `type`, `agency`, `private`, `name`, `email`, `page`, `limit`

**Emergency query params:** `?problemType=cardiac|neurological|bone|respiratory|cut|other`

---

#### Auth — `/api/auth`

| Method | Path                | Auth | Description                          |
|--------|---------------------|------|--------------------------------------|
| POST   | `/register`         | No   | Create account                       |
| POST   | `/login`            | No   | Login, returns access + refresh token|
| POST   | `/refresh-token`    | No   | Get new access token                 |
| GET    | `/me`               | Yes  | Get current user profile             |
| PUT    | `/profile`          | Yes  | Update name, phone, department       |
| POST   | `/change-password`  | Yes  | Change password                      |
| POST   | `/logout`           | Yes  | Logout current session               |
| POST   | `/logout-all`       | Yes  | Logout all devices                   |

---

#### Users — `/api/users` (Admin only)

| Method | Path                    | Description                    |
|--------|-------------------------|--------------------------------|
| GET    | `/`                     | List all users                 |
| GET    | `/stats`                | User count by role/status      |
| GET    | `/:id`                  | Get single user                |
| POST   | `/`                     | Create user                    |
| PUT    | `/:id`                  | Update user                    |
| DELETE | `/:id`                  | Delete user                    |
| PATCH  | `/:id/toggle-status`    | Activate / deactivate          |
| PATCH  | `/:id/reset-password`   | Admin reset password           |
| PATCH  | `/:id/assign-role`      | Change role                    |

---

#### Other

| Method | Path      | Description              |
|--------|-----------|--------------------------|
| GET    | `/health` | Health check (returns 200)|
| GET    | `/`       | API info                 |

---

### Middleware

| File                    | Exports                                                               |
|-------------------------|-----------------------------------------------------------------------|
| `authMiddleware.js`     | `verifyAccessToken` — validates Bearer JWT from Authorization header  |
|                         | `verifyRefreshToken` — validates refresh token from request body      |
|                         | `authorize(...roles)` — role-based guard (admin, doctor, etc.)        |
|                         | `checkPermission(p)` — permission-level guard                         |
| `errorHandler.js`       | `notFoundHandler` — 404 fallback                                      |
|                         | `errorHandler` — global error handler (must be last middleware)       |
| `databaseConnection.js` | `connectDB()` — mongoose connection                                   |

---

## Frontend

### Running the App

```bash
cd frontend
npm install
npm run dev     # starts Vite dev server at http://localhost:5173
npm run build   # production build
```

---

### Components

| Component           | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `Header.jsx`        | Top navbar — logo, nav tabs (Emergency, List, Stats, Add), page search  |
| `HospitalList.jsx`  | Main list view — manages pagination, filter state, refresh triggers     |
| `HospitalFilters.jsx` | Filter sidebar — name, division, district, upazila, type, agency, ownership dropdowns |
| `HospitalTable.jsx` | Table of hospitals with View / Edit / Delete / Map actions              |
| `HospitalModal.jsx` | View or edit a single hospital in a modal overlay                       |
| `CreateHospital.jsx`| Form to add a new hospital (Basic Info → Classification → Location)     |
| `Statistics.jsx`    | Dashboard — total/public/private counts, by-type and by-division tables |
| `EmergencySearch.jsx` | 2-step emergency flow — pick problem type → ranked hospital results   |
| `MapPanel.jsx`      | OpenStreetMap embed with Nominatim geocoding, links to Google Maps/Waze |
| `Pagination.jsx`    | Page controls with ellipsis for large page counts                       |
| `LoadingSpinner.jsx`| Spinner shown during data fetches                                       |
| `ErrorAlert.jsx`    | Error message with optional retry and dismiss buttons                   |
| `ErrorBoundary.jsx` | Class-based React error boundary with recovery button                   |

---

### API Service Layer

**File:** `src/services/api.js`  
**Base URL:** `http://localhost:5000/api/hospitals`

```js
getAllHospitals(page, limit)              // GET /
getHospitalById(id)                       // GET /:id
filterHospitals(filters, page, limit)     // GET /filter/advanced
getDistinctValues(field)                  // GET /distinct/:field
getStatistics()                           // GET /stats
getEmergencyHospitals(problemType)        // GET /emergency?problemType=
createHospital(data)                      // POST /
updateHospital(id, data)                  // PUT /:id
deleteHospital(id)                        // DELETE /:id
deleteByFilter(filters)                   // DELETE /delete/by-filter
```

Errors throw a custom `ApiError` class with `status` and `data` fields.

---

### State Management

No external library. Everything uses React hooks:

- `useState` for local data (hospitals, loading, error, filters, pagination)
- `useEffect` for data fetching on dependency changes
- Callbacks (`onTabChange`, `onFilterChange`, `onRefresh`) lift state up to the parent
- A `refreshTrigger` counter in `App.jsx` forces HospitalList to re-fetch after create/delete

---

### Design System

All design tokens live in `src/index.css` as CSS custom properties:

```css
/* Colors */
--primary:        #1d6fa5   /* Medical blue — main brand color */
--primary-dark:   #155a87
--primary-darker: #0e4266
--primary-light:  #e8f2fb   /* Tinted backgrounds */
--primary-subtle: #f0f7ff

/* Backgrounds */
--bg-body:    #f0f7ff       /* Page background */
--bg-surface: #ffffff       /* Cards, modals */
--bg-muted:   #f8fafc       /* Subtle section fills */

/* Text */
--text-primary:   #1a202c
--text-secondary: #4a5568
--text-muted:     #718096

/* Status */
--success: #16a34a   --success-light: #dcfce7
--danger:  #dc2626   --danger-light:  #fee2e2
--warning: #d97706   --warning-light: #fef3c7
--info:    #0284c7   --info-light:    #e0f2fe

/* Border radius */
--radius-sm: 4px  --radius: 8px  --radius-md: 10px
--radius-lg: 12px  --radius-xl: 16px

/* Transitions */
--transition:      0.18s ease
--transition-slow: 0.3s ease
```

Each component has its own `.css` file co-located alongside the `.jsx`.

---

## Key Flows

### Hospital Search & Filter
1. `HospitalList` mounts → calls `getAllHospitals(1, 50)`
2. User changes a filter in `HospitalFilters` → `onFilterChange` fires
3. `HospitalList` calls `filterHospitals(filters, 1, 50)` and updates table
4. User pages → same filter re-runs with new `page`

### Emergency Care Search
1. User picks a problem type (cardiac, neurological, etc.)
2. `EmergencySearch` calls `getEmergencyHospitals(problemType)`
3. Backend returns up to 30 hospitals sorted by `score` descending
4. Results render as ranked cards with score bars and Directions button
5. Directions opens a `MapPanel` overlay with geocoded location

### Create Hospital
1. User fills form in `CreateHospital` → POST `/api/hospitals`
2. On success, `onSuccess` callback fires in `App.jsx`
3. `refreshTrigger` increments → `HospitalList` re-fetches automatically
4. App switches back to the list tab
