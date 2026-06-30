# Claude Code Prompt — Hospital Manager: Full Microservices + Auth Overhaul

---

## CONTEXT

You are working on an existing project called **Hospital Manager** — a Bangladesh Hospital Management System. The current structure is a monolithic Express backend at `backend/` and a React frontend at `frontend/`. Your job is to **refactor and extend** it into a proper microservices architecture without breaking the existing frontend's API contract.

Current folder layout:
```
Hospital-Manager/
├── backend/          ← existing monolith (keep as reference, do NOT delete)
├── frontend/         ← React 18 + Vite (do NOT touch)
```

---

## OBJECTIVE

Restructure the backend into **three independent services** + **one API Gateway**, all wired together with Docker Compose. Firebase handles all authentication and authorisation. MongoDB Atlas is already provisioned — do not touch it. Add Prisma 6 to the auth service for any relational session/user-metadata persistence needs (use a separate lightweight DB like SQLite or PostgreSQL — your choice, but make it work inside Docker without Atlas).

---

## TARGET ARCHITECTURE

```
Hospital-Manager/
├── services/
│   ├── gateway/              # Express API Gateway (port 3000)
│   ├── auth-service/         # Firebase Auth + JWT + Sessions (port 3001)
│   └── hospital-service/     # Hospital CRUD on MongoDB Atlas (port 3002)
├── frontend/                 # Unchanged
├── docker-compose.yml        # Orchestrates everything EXCEPT MongoDB
└── .env.example              # Master env reference
```

Every service is independently runnable (`npm run dev`) AND Dockerised.

---

## SERVICE 1 — `services/auth-service/` (Port 3001)

### Purpose
Owns all identity, sessions, dual-token issuance, and role/permission enforcement. **Primary auth provider is Firebase Admin SDK**. On top of Firebase, issue your own short-lived **Access JWT** (15 min) and long-lived **Refresh JWT** (7 days) so the rest of the system never calls Firebase on every request.

### Tech Stack
- Node.js 20 + Express 4
- Firebase Admin SDK (`firebase-admin`)
- `jsonwebtoken` for your own JWTs on top of Firebase
- `express-session` + `connect-mongo` for server-side sessions stored in MongoDB Atlas (use `MONGODB_URI` already available)
- **Prisma 6** with PostgreSQL (Dockerised, separate from Atlas) for storing: user profiles, roles, permissions, refresh-token rotation ledger, session metadata
- `bcryptjs` (for any local password fallback)
- `helmet`, `cors`, `express-rate-limit`, `morgan`

### Prisma 6 Schema — create `services/auth-service/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(uuid())
  firebaseUid   String        @unique
  email         String        @unique
  firstName     String
  lastName      String
  phone         String?
  department    String?
  hospitalId    String?       // MongoDB ObjectId as string reference
  role          Role          @default(USER)
  isActive      Boolean       @default(true)
  permissions   String[]      @default([])
  lastLogin     DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  refreshTokens RefreshToken[]
  sessions      Session[]
}

model RefreshToken {
  id          String    @id @default(uuid())
  token       String    @unique
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  isRevoked   Boolean   @default(false)
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  ipAddress   String?
  userAgent   String?
}

model Session {
  id          String    @id @default(uuid())
  sessionId   String    @unique
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  ipAddress   String?
  userAgent   String?
  isActive    Boolean   @default(true)
}

enum Role {
  ADMIN
  STAFF
  DOCTOR
  MANAGER
  USER
}
```

Run `npx prisma migrate dev --name init` to apply.

### Auth Flows to Implement

#### Registration — `POST /api/auth/register`
1. Accept `{ firstName, lastName, email, password, role? }`
2. Create user in **Firebase Auth** via Admin SDK (`admin.auth().createUser(...)`)
3. Create corresponding record in **Prisma** `User` table
4. Return `{ message: "Registered successfully" }` — do NOT issue tokens here, force login

#### Login — `POST /api/auth/login`
1. Accept `{ idToken }` — the Firebase ID token obtained client-side after Firebase sign-in
2. Verify `idToken` with `admin.auth().verifyIdToken(idToken)`
3. Fetch Prisma `User` by `firebaseUid`; reject if `isActive === false`
4. Issue your own **Access JWT**: `{ uid, email, role, permissions, hospitalId }`, signed with `JWT_ACCESS_SECRET`, expires `15m`
5. Issue your own **Refresh JWT**: signed with `JWT_REFRESH_SECRET`, expires `7d`
6. Store refresh token in Prisma `RefreshToken` table with IP, user-agent, expiry
7. Create `express-session` entry; store `{ userId, role }` in session
8. Set `refreshToken` as **HttpOnly, Secure, SameSite=Strict** cookie
9. Return `{ accessToken, user: { id, email, firstName, lastName, role, permissions } }`

#### Refresh Token — `POST /api/auth/refresh-token`
1. Read refresh token from HttpOnly cookie OR `{ refreshToken }` body
2. Verify JWT signature; check Prisma `RefreshToken.isRevoked`
3. Rotate: revoke old token, issue new refresh token (store in DB), issue new access token
4. Return `{ accessToken }`

#### Logout — `POST /api/auth/logout`
1. Verify access token (Bearer header)
2. Revoke current refresh token in Prisma
3. Destroy `express-session`
4. Clear cookie
5. Optionally revoke Firebase session: `admin.auth().revokeRefreshTokens(firebaseUid)`

#### Logout All Devices — `POST /api/auth/logout-all`
1. Revoke ALL `RefreshToken` rows for this user in Prisma
2. Destroy all sessions
3. Call `admin.auth().revokeRefreshTokens(firebaseUid)` to kill Firebase sessions everywhere

#### Get Profile — `GET /api/auth/me`
- Requires valid Access JWT (Bearer)
- Return Prisma `User` record (exclude tokens)

#### Update Profile — `PUT /api/auth/profile`
- Update `firstName`, `lastName`, `phone`, `department` in Prisma
- Mirror email change to Firebase if email is changed

#### Change Password — `POST /api/auth/change-password`
- Use Firebase Admin SDK: `admin.auth().updateUser(firebaseUid, { password: newPassword })`
- Rotate all refresh tokens (security)

### Admin User Routes — `GET|POST|PUT|DELETE /api/users` (admin only)

Replicate all routes from the existing `backend/routes/users` but backed by Prisma instead of Mongoose:

- `GET /api/users` — list all (paginated)
- `GET /api/users/stats` — count by role/status
- `GET /api/users/:id`
- `POST /api/users` — admin creates user (calls Firebase + Prisma)
- `PUT /api/users/:id`
- `DELETE /api/users/:id` — deletes from Firebase AND Prisma
- `PATCH /api/users/:id/toggle-status`
- `PATCH /api/users/:id/reset-password` — uses Firebase Admin
- `PATCH /api/users/:id/assign-role`

### Middleware to Create

```
services/auth-service/src/middleware/
├── verifyFirebaseToken.js     # Verifies raw Firebase idToken (used at login)
├── verifyAccessJWT.js         # Verifies your own issued Access JWT (used on all protected routes)
├── verifyRefreshJWT.js        # Verifies Refresh JWT from cookie/body
├── authorize.js               # authorize(...roles) — role guard
├── checkPermission.js         # checkPermission('permission:name') — permission guard
├── sessionCheck.js            # Validates active express-session
├── rateLimiter.js             # Strict rate limiter for /login, /register (5 req/15min)
└── errorHandler.js            # Global error handler
```

### Service Entry Point — `services/auth-service/src/server.js`

```js
// Must:
// 1. Init Firebase Admin SDK from FIREBASE_SERVICE_ACCOUNT_JSON env var
// 2. Connect Prisma client
// 3. Mount express-session with connect-mongo
// 4. Mount all routes under /api/auth and /api/users
// 5. Health check: GET /health
// 6. Global error handler last
```

---

## SERVICE 2 — `services/hospital-service/` (Port 3002)

### Purpose
Owns all hospital data. Connects directly to **MongoDB Atlas** via Mongoose. This service is **internal** — it trusts the Gateway's forwarded auth headers and does NOT re-verify Firebase or JWTs itself (the Gateway handles auth).

### Tech Stack
- Node.js 20 + Express 4
- Mongoose 8
- `helmet`, `cors` (restricted to gateway only), `morgan`

### Keep ALL existing Mongoose models unchanged:
- `Hospital` model — exact same schema as documented in PROJECT.md
- Copy from `backend/models/Hospital.js`

### Routes — replicate everything from existing `backend/routes/hospitals.js`

All endpoints under `GET|POST|PUT|DELETE /api/hospitals/*` as documented:

- `GET /api/hospitals` — paginated list
- `GET /api/hospitals/:id`
- `GET /api/hospitals/filter/advanced`
- `GET /api/hospitals/distinct/:field`
- `GET /api/hospitals/stats`
- `GET /api/hospitals/emergency`
- `GET /api/hospitals/docs`
- `POST /api/hospitals`
- `PUT /api/hospitals/:id`
- `DELETE /api/hospitals/:id`
- `DELETE /api/hospitals/delete/by-filter`
- `DELETE /api/hospitals/delete-all`

### Auth in Hospital Service
This service receives a forwarded header `X-User-ID`, `X-User-Role`, `X-User-Permissions` from the Gateway. Create a lightweight `trustedGateway.js` middleware that:
1. Checks that requests come from the Gateway's internal Docker network (`X-Gateway-Secret` header must match `GATEWAY_SECRET` env var)
2. Injects `req.user = { id, role, permissions }` from forwarded headers

Apply role guards on write operations:
- `POST`, `PUT`, `DELETE` → require role `admin` or `manager`
- `GET` routes → public (no auth needed)

### Service Entry Point — `services/hospital-service/src/server.js`
- Connect Mongoose to `MONGODB_URI`
- Mount routes
- Health check: `GET /health`
- Error handler

---

## SERVICE 3 — `services/gateway/` (Port 3000)

### Purpose
Single entry point for the frontend. Proxies requests to the correct downstream service, verifies Access JWTs on protected routes, forwards user identity headers, and handles CORS for the browser.

### Tech Stack
- Node.js 20 + Express 4
- `http-proxy-middleware` for proxying
- `jsonwebtoken` to verify Access JWT (same `JWT_ACCESS_SECRET`)
- `helmet`, `cors`, `morgan`, `express-rate-limit`

### Routing Table

| Incoming path (Gateway :3000) | Proxied to |
|-------------------------------|------------|
| `/api/auth/*` | `auth-service:3001/api/auth/*` |
| `/api/users/*` | `auth-service:3001/api/users/*` |
| `/api/hospitals/*` | `hospital-service:3002/api/hospitals/*` |
| `/health` | Gateway own health check |

### Gateway Auth Middleware — `services/gateway/src/middleware/gatewayAuth.js`

```
For every request to /api/hospitals/* that requires auth (POST, PUT, DELETE):
1. Extract Bearer token from Authorization header
2. Verify with JWT_ACCESS_SECRET
3. If valid: attach X-User-ID, X-User-Role, X-User-Permissions, X-Gateway-Secret headers before proxying
4. If invalid: return 401 immediately, do NOT proxy

For public GET /api/hospitals/* routes:
- Pass through with X-Gateway-Secret only (no user headers)

For /api/auth/* routes:
- Pass through as-is (auth service handles its own verification)
```

### Rate Limiting at Gateway
- Global: 200 req/min per IP
- `/api/auth/login` + `/api/auth/register`: 5 req/15min per IP
- `/api/hospitals` write routes: 30 req/min per IP

### CORS
- Allow only `CORS_ORIGIN` (frontend URL)
- Credentials: true (for cookies)

### Entry Point — `services/gateway/src/server.js`
```js
// Mount cors, helmet, morgan, rate limiters
// Mount gatewayAuth middleware
// Mount proxy routes
// Health: GET /health → { status: 'ok', services: ['auth', 'hospital'] }
// 404 handler
```

---

## DOCKER SETUP

### `docker-compose.yml` (root level)

Create a production-ready Docker Compose with these services. **Do NOT include MongoDB** — it is on Atlas.

```yaml
version: '3.9'

services:

  postgres:
    image: postgres:16-alpine
    container_name: hm_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: hospital_auth
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - hm_network

  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: hm_auth
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - ./services/auth-service/.env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - hm_network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  hospital-service:
    build:
      context: ./services/hospital-service
      dockerfile: Dockerfile
    container_name: hm_hospital
    restart: unless-stopped
    ports:
      - "3002:3002"
    env_file:
      - ./services/hospital-service/.env
    networks:
      - hm_network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  gateway:
    build:
      context: ./services/gateway
      dockerfile: Dockerfile
    container_name: hm_gateway
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./services/gateway/.env
    depends_on:
      auth-service:
        condition: service_healthy
      hospital-service:
        condition: service_healthy
    networks:
      - hm_network

volumes:
  postgres_data:

networks:
  hm_network:
    driver: bridge
```

### Dockerfiles

Write a multi-stage `Dockerfile` for EACH service using this pattern:

```dockerfile
# Stage 1 — deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2 — build (for auth-service: also run prisma generate)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# auth-service only:
RUN npx prisma generate

# Stage 3 — runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
# auth-service only:
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json .
EXPOSE <PORT>
CMD ["node", "src/server.js"]
```

### `.dockerignore` for each service
```
node_modules
.env
*.log
.git
coverage
```

---

## PRISMA MIGRATION ENTRYPOINT

In `auth-service/Dockerfile`, add a startup script `services/auth-service/scripts/start.sh`:

```bash
#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting auth service..."
node src/server.js
```

Update the auth-service Dockerfile CMD to use this script.

---

## PACKAGE.JSON FOR EACH SERVICE

Each service needs its own `package.json`. Include:

**auth-service:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "express": "^4.19.0",
    "firebase-admin": "^12.0.0",
    "jsonwebtoken": "^9.0.0",
    "express-session": "^1.18.0",
    "connect-mongo": "^5.1.0",
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.0",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "nodemon": "^3.0.0"
  }
}
```

**hospital-service:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.0.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.0"
  }
}
```

**gateway:**
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.19.0",
    "http-proxy-middleware": "^3.0.0",
    "jsonwebtoken": "^9.0.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.0",
    "cookie-parser": "^1.4.6"
  }
}
```

---

## FRONTEND API SERVICE UPDATE

Update `frontend/src/services/api.js`:
- Change base URL from `http://localhost:5000` → `http://localhost:3000` (the Gateway)
- All auth endpoints: `http://localhost:3000/api/auth/...`
- All hospital endpoints: `http://localhost:3000/api/hospitals/...`
- Add `credentials: 'include'` to all fetch calls so cookies are sent
- Add `Authorization: Bearer <accessToken>` header injection from localStorage for protected calls
- Add a token-refresh interceptor: if any request returns 401, auto-call `/api/auth/refresh-token`, retry once

---

## CODE QUALITY REQUIREMENTS

- Every async route must be wrapped in `try/catch` or use an `asyncHandler` wrapper
- All errors must flow to the global error handler with `{ success: false, message, code, stack (dev only) }`
- Use `helmet()` on every service
- Use structured logging with `morgan('combined')` in production
- Validate all request bodies with `express-validator` or manual checks; return `400` with field errors on bad input
- No `console.log` in production paths — use a simple logger utility
- All secrets via `process.env` — no hardcoded values anywhere
- Session cookie must be: `httpOnly: true, secure: true (prod), sameSite: 'strict'`
- Refresh token cookie same flags

---

## ⚠️ ENVIRONMENT VARIABLES — COMPLETE REFERENCE

After building everything, create a `services/auth-service/.env.example`, `services/hospital-service/.env.example`, `services/gateway/.env.example`, AND a root `.env.example`. Tell the developer exactly what goes where:

---

### `services/auth-service/.env`

```env
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL (Prisma) — for user profiles, sessions, refresh tokens
DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@postgres:5432/hospital_auth

# MongoDB Atlas — for express-session store (connect-mongo)
MONGODB_URI=<YOUR_ATLAS_URI>   # same Atlas cluster, different collection

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<different-64-char-random-hex>
JWT_REFRESH_EXPIRES_IN=7d

# Session
SESSION_SECRET=<another-64-char-random-hex>
SESSION_NAME=hm_session        # cookie name

# Firebase Admin SDK
# Go to: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
# Download the JSON, then stringify it:
# node -e "console.log(JSON.stringify(require('./firebase-key.json')))"
# Paste the result as a single-line string:
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# CORS
CORS_ORIGIN=http://localhost:3000   # gateway origin (internal)

# Gateway secret (must match gateway .env)
GATEWAY_SECRET=<random-hex>
```

**Where to get Firebase values:**
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Select your project → ⚙️ Project Settings → **Service Accounts** tab
3. Click **Generate new private key** → download JSON
4. Stringify: `node -e "console.log(JSON.stringify(require('./firebase-key.json')))"`
5. Paste entire output as `FIREBASE_SERVICE_ACCOUNT_JSON`

---

### `services/hospital-service/.env`

```env
# Server
PORT=3002
NODE_ENV=development

# MongoDB Atlas — your existing Atlas cluster
MONGODB_URI=<YOUR_ATLAS_URI>   # e.g. mongodb+srv://user:pass@cluster.mongodb.net/hospital-manager

# Gateway internal secret (must match auth-service and gateway)
GATEWAY_SECRET=<same-random-hex-as-above>

# CORS — restrict to internal gateway only
CORS_ORIGIN=http://gateway:3000
```

---

### `services/gateway/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Downstream service URLs (Docker internal network names)
AUTH_SERVICE_URL=http://auth-service:3001
HOSPITAL_SERVICE_URL=http://hospital-service:3002

# JWT Access token verification (same secret as auth-service)
JWT_ACCESS_SECRET=<same-secret-as-auth-service>

# Gateway → Service auth header
GATEWAY_SECRET=<same-random-hex>

# CORS — allow the browser/frontend
CORS_ORIGIN=http://localhost:5173   # Vite dev server

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000         # 1 minute
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
```

---

### Root `.env` (for Docker Compose)

```env
# PostgreSQL Docker container creds
POSTGRES_USER=hm_user
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=hospital_auth
```

---

## FINAL FILE STRUCTURE TO PRODUCE

```
Hospital-Manager/
├── services/
│   ├── gateway/
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── middleware/
│   │   │   │   ├── gatewayAuth.js
│   │   │   │   └── rateLimiter.js
│   │   │   └── routes/
│   │   │       └── proxy.js
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── auth-service/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── scripts/
│   │   │   └── start.sh
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── config/
│   │   │   │   ├── firebase.js        # init firebase-admin
│   │   │   │   └── prisma.js          # prisma client singleton
│   │   │   ├── middleware/
│   │   │   │   ├── verifyFirebaseToken.js
│   │   │   │   ├── verifyAccessJWT.js
│   │   │   │   ├── verifyRefreshJWT.js
│   │   │   │   ├── authorize.js
│   │   │   │   ├── checkPermission.js
│   │   │   │   ├── sessionCheck.js
│   │   │   │   ├── rateLimiter.js
│   │   │   │   └── errorHandler.js
│   │   │   ├── controllers/
│   │   │   │   ├── authController.js
│   │   │   │   └── userController.js
│   │   │   ├── routes/
│   │   │   │   ├── auth.js
│   │   │   │   └── users.js
│   │   │   └── utils/
│   │   │       ├── tokenUtils.js      # sign/verify access & refresh JWT
│   │   │       ├── cookieUtils.js     # set/clear cookie helpers
│   │   │       └── logger.js
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── hospital-service/
│       ├── src/
│       │   ├── server.js
│       │   ├── config/
│       │   │   └── database.js
│       │   ├── middleware/
│       │   │   ├── trustedGateway.js
│       │   │   ├── authorize.js
│       │   │   └── errorHandler.js
│       │   ├── models/
│       │   │   └── Hospital.js        # copied from backend/models/Hospital.js
│       │   ├── controllers/
│       │   │   └── hospitalController.js
│       │   └── routes/
│       │       └── hospitals.js
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── .env.example
│       └── package.json
│
├── docker-compose.yml
├── .env.example                       # root env for Docker Compose postgres vars
└── .env                               # (gitignored)
```

---

## IMPLEMENTATION ORDER

Implement in this exact order to avoid dependency issues:

1. **Root `docker-compose.yml`** and root `.env.example`
2. **`services/auth-service/prisma/schema.prisma`**
3. **`services/auth-service/` — full implementation** (config → utils → middleware → controllers → routes → server.js → Dockerfile → start.sh)
4. **`services/hospital-service/` — full implementation** (copy Hospital model, implement trustedGateway middleware, controllers, routes → server.js → Dockerfile)
5. **`services/gateway/` — full implementation** (proxy routes, gatewayAuth middleware → server.js → Dockerfile)
6. **Update `frontend/src/services/api.js`** — change base URL, add credentials, add refresh interceptor
7. **Create all `.env.example` files** with complete annotations
8. **Final verification**: run `docker-compose up --build` and confirm all three services + postgres start healthy

---

## CONSTRAINTS & RULES

- Do NOT modify `frontend/` except `src/services/api.js` and only for base URL + auth headers
- Do NOT modify or delete `backend/` — leave it as-is
- Do NOT provision or configure MongoDB — assume Atlas is already running
- Firebase is the single source of truth for identity — all password changes, account creation, and deletion MUST go through Firebase Admin SDK
- Prisma is the source of truth for roles, permissions, sessions, and refresh token state
- The hospital service must NEVER verify JWTs itself — trust Gateway headers only
- All `.env` files must be `.gitignore`d — only `.env.example` files are committed
- Use `async/await` throughout — no callbacks
- Every route must return consistent JSON: `{ success: true, data: ... }` or `{ success: false, message: ..., code: ... }`
