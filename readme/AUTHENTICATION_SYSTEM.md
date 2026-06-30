# Hospital Manager - Backend Authentication System

## Overview

Complete JWT-based authentication and authorization system with role-based access control (RBAC), refresh token management, and comprehensive user management capabilities.

---

## ✨ Features

### Authentication

- ✅ User Registration with validation
- ✅ User Login with password verification
- ✅ JWT Access Tokens (15 minutes expiration)
- ✅ JWT Refresh Tokens (7 days expiration)
- ✅ Token Refresh Mechanism
- ✅ Multi-device Logout
- ✅ Password Change
- ✅ Profile Management

### Authorization & Access Control

- ✅ Role-Based Access Control (RBAC)
- ✅ Five User Roles: Admin, Manager, Doctor, Staff, User
- ✅ Permission-Based Authorization
- ✅ Admin-Only Operations Protection
- ✅ User Status Management (Active/Inactive)

### User Management (Admin)

- ✅ List Users with Pagination & Filters
- ✅ Create Users (Admin)
- ✅ Update User Information
- ✅ Delete Users
- ✅ Reset User Passwords
- ✅ Assign/Change User Roles
- ✅ User Statistics & Analytics
- ✅ Activate/Deactivate Users

### Security

- ✅ Password Hashing (bcryptjs)
- ✅ JWT Token Validation
- ✅ Server-Side Refresh Token Management
- ✅ Token Revocation on Logout
- ✅ CORS Protection
- ✅ Input Validation
- ✅ Error Handling

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcryptjs
- **Other:** CORS, dotenv

---

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Configuration

Create or update `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

### Start Development Server

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 📂 Project Structure

```
backend/
├── controllers/
│   ├── authController.js          # Auth logic (register, login, logout)
│   ├── userController.js          # User management (CRUD, roles)
│   └── hospitalController.js      # Hospital management (existing)
│
├── middleware/
│   ├── authMiddleware.js          # JWT verification & authorization
│   └── errorHandler.js            # Error handling
│
├── models/
│   ├── User.js                    # User schema & validation
│   ├── Hospital.js                # Hospital schema (existing)
│   └── refreshTokens              # Stored in User model
│
├── routes/
│   ├── authRoutes.js              # Authentication endpoints
│   ├── userRoutes.js              # User management endpoints
│   └── hospitalRoutes.js          # Hospital endpoints (existing)
│
├── utils/
│   └── databaseConnection.js      # MongoDB connection
│
├── server.js                      # Main server file
├── package.json                   # Dependencies
├── .env                           # Environment variables
├── AUTH_API_DOCUMENTATION.md      # Complete API reference
├── AUTH_SETUP_GUIDE.md            # Setup instructions
└── AUTHENTICATION_SYSTEM.md       # This file
```

---

## 🔐 User Roles

### Admin

- Full system access
- Manage all users
- Create/update/delete users
- View analytics
- Reset user passwords
- Assign roles

### Manager

- Manage staff
- View reports
- Limited hospital management

### Doctor

- View patient records
- Update medical records
- View assigned tasks

### Staff

- View general data
- Process basic operations
- Limited hospital data access

### User

- View own data only
- Update own profile
- Change own password

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Endpoint           | Method | Auth | Description          |
| ------------------ | ------ | ---- | -------------------- |
| `/register`        | POST   | No   | Register new user    |
| `/login`           | POST   | No   | User login           |
| `/refresh-token`   | POST   | No   | Get new access token |
| `/me`              | GET    | Yes  | Get current user     |
| `/profile`         | PUT    | Yes  | Update profile       |
| `/change-password` | POST   | Yes  | Change password      |
| `/logout`          | POST   | Yes  | Logout device        |
| `/logout-all`      | POST   | Yes  | Logout all devices   |

### User Management (`/api/users`) - Admin Only

| Endpoint              | Method | Auth | Admin | Description         |
| --------------------- | ------ | ---- | ----- | ------------------- |
| `/`                   | GET    | Yes  | Yes   | List all users      |
| `/stats`              | GET    | Yes  | Yes   | User statistics     |
| `/:id`                | GET    | Yes  | Yes   | Get user details    |
| `/`                   | POST   | Yes  | Yes   | Create user         |
| `/:id`                | PUT    | Yes  | Yes   | Update user         |
| `/:id`                | DELETE | Yes  | Yes   | Delete user         |
| `/:id/toggle-status`  | PATCH  | Yes  | Yes   | Activate/deactivate |
| `/:id/reset-password` | PATCH  | Yes  | Yes   | Reset password      |
| `/:id/assign-role`    | PATCH  | Yes  | Yes   | Change role         |

---

## 🔑 Token Management

### Access Token

- **Duration:** 15 minutes
- **Use:** API request authentication
- **Storage:** Authorization header as Bearer token
- **Expiration Handling:** Auto-refresh with refresh token

### Refresh Token

- **Duration:** 7 days
- **Use:** Obtain new access tokens
- **Storage:** Server-side in database
- **Revocation:** On logout or password change

### Token Flow

```
1. User registers/logs in
   ↓
2. Server generates access + refresh tokens
   ↓
3. Client stores tokens
   ↓
4. Client uses access token for API calls
   ↓
5. Access token expires (15 min)
   ↓
6. Client calls refresh-token endpoint
   ↓
7. Server validates and returns new access token
   ↓
8. Client retries with new token
```

---

## 🔓 Authentication Flow

### Registration

```
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
↓
→ User created
→ Tokens generated
→ User can login immediately
```

### Login

```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
↓
→ Credentials verified
→ Tokens generated
→ lastLogin updated
```

### Refresh Token

```
POST /api/auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
↓
→ Token validated
→ New access token generated
→ Client can resume requests
```

### Logout

```
POST /api/auth/logout
Headers: { Authorization: Bearer accessToken }
Body: { "refreshToken": "eyJhbGciOiJIUzI1..." }
↓
→ Refresh token removed
→ User logged out from current device
```

---

## 💾 Database Schema

### User Model

```javascript
{
  // Basic Info
  firstName: String,           // Required
  lastName: String,            // Required
  email: String,               // Required, unique, lowercase
  password: String,            // Required, hashed, min 6 chars
  phone: String,               // Optional

  // Role & Permissions
  role: String,                // admin | staff | doctor | manager | user
  department: String,          // Optional
  permissions: [String],       // Optional, custom permissions

  // Account Status
  isActive: Boolean,           // Default: true
  lastLogin: Date,             // Last login timestamp

  // Hospital Association
  hospitalId: ObjectId,        // Reference to hospital

  // Profile
  profilePicture: String,      // Optional, URL

  // Token Management
  refreshTokens: [
    {
      token: String,           // Refresh token
      createdAt: Date          // Expires after 7 days
    }
  ],

  // Timestamps
  createdAt: Date,             // Auto-generated
  updatedAt: Date              // Auto-generated
}
```

---

## 🛡️ Security Features

### Password Security

- Bcryptjs hashing with 10 salt rounds
- Minimum 6 characters
- Never returned in API responses
- Automatically hashed before database save

### Token Security

- JWT tokens validated on every request
- Refresh tokens stored server-side for revocation
- Tokens contain userId and role
- Tokens signed with secret key

### Account Security

- Email uniqueness enforced
- Account can be deactivated
- Login attempts tracked
- Password changes clear all tokens
- Can logout from all devices

### API Security

- CORS protection configured
- Authorization headers required
- Role-based access control
- Input validation on all endpoints
- Error messages don't leak sensitive info

---

## 📋 Example Usage

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {accessToken}"
```

### Admin: List All Users

```bash
curl -X GET "http://localhost:5000/api/users?role=doctor&page=1&limit=10" \
  -H "Authorization: Bearer {adminAccessToken}"
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

---

## ⚠️ Error Handling

### Common Error Codes

| Code                  | Status | Message                  |
| --------------------- | ------ | ------------------------ |
| UNAUTHORIZED          | 401    | Invalid or missing token |
| TOKEN_EXPIRED         | 401    | Access token expired     |
| REFRESH_TOKEN_EXPIRED | 401    | Refresh token expired    |
| FORBIDDEN             | 403    | Insufficient permissions |
| NOT_FOUND             | 404    | Resource not found       |
| CONFLICT              | 409    | Resource already exists  |
| VALIDATION_ERROR      | 400    | Invalid input            |
| SERVER_ERROR          | 500    | Internal server error    |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "error": "Detailed error (development only)"
}
```

---

## 🔍 Debugging

### Enable Detailed Logging

In `server.js`, logs are automatically enabled:

```
✓ Server running on http://localhost:5000
✓ MongoDB Connected: ...
```

### Check Token Claims

Decode JWT at https://jwt.io to verify:

- userId
- role
- iat (issued at)
- exp (expiration)

### Test Authorization

```bash
# This will fail (no admin role)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer {userAccessToken}"

# This will succeed (admin role)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer {adminAccessToken}"
```

---

## 🚢 Production Deployment

### Environment Setup

```env
NODE_ENV=production
JWT_SECRET=use-very-strong-random-key-min-32-characters
CORS_ORIGIN=https://yourdomain.com
MONGODB_URI=mongodb+srv://prod_user:pass@prod_cluster.mongodb.net/prod_db
PORT=5000
```

### Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS only
- [ ] Set specific CORS_ORIGIN (not "\*")
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Use environment-specific secrets
- [ ] Enable request logging
- [ ] Set up monitoring/alerts
- [ ] Implement rate limiting
- [ ] Use secure HTTPS cookies for refresh tokens
- [ ] Regular security audits

### Performance Optimization

- [ ] Enable database indexing
- [ ] Implement caching for user queries
- [ ] Use connection pooling
- [ ] Monitor database performance
- [ ] Implement request rate limiting
- [ ] Use CDN for static files

---

## 🔄 Integration with Frontend

### Step 1: Store Tokens

```javascript
// After login/register
localStorage.setItem("accessToken", response.data.accessToken);
localStorage.setItem("refreshToken", response.data.refreshToken);
```

### Step 2: Add to API Calls

```javascript
// Add Authorization header
fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### Step 3: Handle Token Expiration

```javascript
// If 401 response with TOKEN_EXPIRED
const response = await fetch("/api/auth/refresh-token", {
  method: "POST",
  body: JSON.stringify({ refreshToken }),
});
const newAccessToken = response.data.accessToken;
// Retry original request
```

### Step 4: Implement Logout

```javascript
await fetch("/api/auth/logout", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ refreshToken }),
});
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
```

---

## 📚 Documentation Files

1. **AUTH_API_DOCUMENTATION.md** - Complete API reference with examples
2. **AUTH_SETUP_GUIDE.md** - Installation and setup instructions
3. **AUTHENTICATION_SYSTEM.md** - This comprehensive guide

---

## 🎯 Next Steps

1. **Frontend Integration**
   - Implement login/register forms
   - Store and manage tokens
   - Handle token expiration
   - Add role-based UI rendering

2. **Additional Features** (Optional)
   - Two-factor authentication
   - Email verification
   - Social login (Google, GitHub)
   - Password reset via email
   - User activity logging
   - Advanced analytics

3. **Testing**
   - Unit tests for controllers
   - Integration tests for endpoints
   - Performance tests
   - Security testing

4. **Monitoring**
   - Setup error tracking
   - Monitor login attempts
   - Track API usage
   - Performance monitoring

---

## 💬 Support & Issues

### Common Issues

**Q: "No access token provided"**
A: Make sure Authorization header is included: `Authorization: Bearer {token}`

**Q: "Invalid or expired token"**
A: Use refresh-token endpoint to get new access token

**Q: "Access denied" error**
A: User doesn't have required role, ask admin to upgrade

**Q: "Email already registered"**
A: Use different email or reset password if forgotten

### Resources

- Check ENV variables are set correctly
- Verify MongoDB connection
- Review error messages returned by API
- Check JWT_SECRET is consistent

---

## 📝 Version History

### v1.0.0 (May 30, 2024)

- Initial authentication system
- JWT token management
- User management endpoints
- Role-based access control
- Password hashing & verification
- Multi-device logout

---

## 📄 License

Hospital Manager System - All Rights Reserved

---

## 👨‍💻 Author

Developed as part of Hospital Manager System

For questions or support, please contact the development team.

---

**Last Updated:** May 30, 2024
**Backend Version:** 1.0.0
**Status:** Production Ready ✓
