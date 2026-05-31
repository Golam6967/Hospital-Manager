# 🚀 QUICK REFERENCE - Hospital Manager Backend Auth System

## ⚡ Start Server

```bash
cd backend
npm run dev
```

**Server:** http://localhost:5000

---

## 📋 API Endpoints Quick Reference

### PUBLIC ENDPOINTS (No Auth Required)

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/refresh-token     - Get new access token
```

### PROTECTED ENDPOINTS (Auth Required)

```
GET    /api/auth/me                - Get current user
PUT    /api/auth/profile           - Update profile
POST   /api/auth/change-password   - Change password
POST   /api/auth/logout            - Logout device
POST   /api/auth/logout-all        - Logout all devices
```

### ADMIN ENDPOINTS (Admin Auth Required)

```
GET    /api/users                  - List all users
GET    /api/users/:id              - Get user by ID
POST   /api/users                  - Create user
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user
PATCH  /api/users/:id/toggle-status       - Activate/deactivate
PATCH  /api/users/:id/reset-password      - Reset password
PATCH  /api/users/:id/assign-role         - Change role
GET    /api/users/stats            - User statistics
```

---

## 🔑 Token Headers

### Access Token

```
Authorization: Bearer {accessToken}
```

### Refresh Token

```json
{
  "refreshToken": "{refreshToken}"
}
```

---

## 👤 User Roles

| Role    | Level | Access             |
| ------- | ----- | ------------------ |
| admin   | 5     | Full system access |
| manager | 4     | Staff + reports    |
| doctor  | 3     | Patient records    |
| staff   | 2     | General data       |
| user    | 1     | Own data           |

---

## ⏱️ Token Expiration

| Token   | Duration | Behavior                 |
| ------- | -------- | ------------------------ |
| Access  | 15 min   | Returns 401, use refresh |
| Refresh | 7 days   | Requires new login       |

---

## 📝 Common Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@hospital.com",
    "password": "Password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@hospital.com",
    "password": "Password123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {accessToken}"
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "{refreshToken}"}'
```

### List Users (Admin)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer {adminToken}"
```

---

## 🛡️ Security

| Feature    | Implementation       |
| ---------- | -------------------- |
| Passwords  | bcryptjs (10 rounds) |
| Tokens     | JWT signed           |
| Refresh    | Server-side DB       |
| Revocation | On logout            |
| Roles      | 5 predefined         |
| Validation | All inputs           |

---

## 🐛 Common Errors

| Error         | Status | Solution                  |
| ------------- | ------ | ------------------------- |
| No token      | 401    | Add Authorization header  |
| Invalid token | 401    | Login again               |
| Token expired | 401    | Use refresh-token         |
| Access denied | 403    | Ask admin for higher role |
| Email exists  | 409    | Use different email       |
| Not found     | 404    | Check ID parameter        |
| Bad request   | 400    | Check required fields     |

---

## 📚 Documentation Files

```
backend/
├── IMPLEMENTATION_COMPLETE.md     ← Main summary
├── AUTH_API_DOCUMENTATION.md      ← Full API reference
├── AUTH_SETUP_GUIDE.md            ← Setup instructions
├── AUTHENTICATION_SYSTEM.md       ← System overview
├── TESTING_GUIDE.md               ← 23 test cases
└── QUICK_REFERENCE.md             ← This file
```

---

## ✅ File Structure

```
Created:
✓ models/User.js
✓ controllers/authController.js
✓ controllers/userController.js
✓ middleware/authMiddleware.js
✓ routes/authRoutes.js
✓ routes/userRoutes.js

Updated:
✓ server.js (routes added)
✓ package.json (dependencies)
```

---

## 🎯 Feature Summary

- ✅ User Registration
- ✅ User Login
- ✅ Access Token (15 min)
- ✅ Refresh Token (7 days)
- ✅ Profile Management
- ✅ Password Change
- ✅ Multi-device Logout
- ✅ Role-Based Access
- ✅ Admin User Management
- ✅ User Statistics
- ✅ Account Activation
- ✅ Password Reset

---

## 🚀 Next Steps

1. **Start Server:** `npm run dev`
2. **Test Endpoints:** Use TESTING_GUIDE.md
3. **Integrate Frontend:** Store tokens, add headers
4. **Deploy:** Update JWT_SECRET, set CORS_ORIGIN

---

## 📞 Help

- Full API docs → `AUTH_API_DOCUMENTATION.md`
- Setup issues → `AUTH_SETUP_GUIDE.md`
- Test endpoints → `TESTING_GUIDE.md`
- System info → `AUTHENTICATION_SYSTEM.md`

---

## 💾 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## Status: ✅ PRODUCTION READY

All components built, tested, and documented.
Ready for frontend integration and deployment.

**Version:** 1.0.0
**Date:** May 30, 2024
