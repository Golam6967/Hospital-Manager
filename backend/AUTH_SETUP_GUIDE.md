# Authentication System - Quick Setup Guide

## Prerequisites

- Node.js installed
- MongoDB Atlas account with connection string
- Environment variables configured

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies including:

- `bcryptjs`: For password hashing
- `jsonwebtoken`: For JWT token generation and verification
- `firebase-admin`: For Firebase services (optional)

### 2. Environment Configuration

Update your `.env` file in the backend directory with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

PORT=5000

NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

CORS_ORIGIN=http://localhost:3000

FIREBASE_SERVICE_ACCOUNT=firebase.admin.json

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

GROQ_API_KEY=your-groq-api-key
```

### 3. Start the Server

```bash
npm run dev
```

The server should start at `http://localhost:5000`

---

## File Structure

```
backend/
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── userController.js       # User management logic
│   └── hospitalController.js   # Hospital management (existing)
├── middleware/
│   ├── authMiddleware.js       # JWT verification & authorization
│   └── errorHandler.js         # Error handling
├── models/
│   ├── User.js                 # User schema with validation
│   └── Hospital.js             # Hospital schema (existing)
├── routes/
│   ├── authRoutes.js           # Authentication endpoints
│   ├── userRoutes.js           # User management endpoints
│   └── hospitalRoutes.js       # Hospital endpoints (existing)
├── utils/
│   └── databaseConnection.js   # MongoDB connection
├── server.js                   # Main server file
├── package.json                # Dependencies
├── .env                        # Environment variables (create this)
└── AUTH_API_DOCUMENTATION.md   # Complete API docs
```

---

## Core Features Implemented

### 1. User Authentication

- ✅ User Registration with validation
- ✅ User Login with password verification
- ✅ JWT Access Token (15 min expiration)
- ✅ JWT Refresh Token (7 days expiration)
- ✅ Token Refresh Endpoint
- ✅ Logout (single device)
- ✅ Logout All (all devices)

### 2. User Management (Admin)

- ✅ Get all users with pagination and filters
- ✅ Get user by ID
- ✅ Create user (admin only)
- ✅ Update user information
- ✅ Delete user account
- ✅ Toggle user status (activate/deactivate)
- ✅ Reset user password
- ✅ Assign/change user role
- ✅ User statistics and analytics

### 3. User Profile Management

- ✅ Get current user profile
- ✅ Update profile information
- ✅ Change password
- ✅ View login history

### 4. Authorization & Roles

- ✅ Role-based access control (RBAC)
- ✅ Five roles: admin, staff, doctor, manager, user
- ✅ Permission-based authorization
- ✅ Middleware for role verification
- ✅ Admin-only endpoints protection

### 5. Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token validation
- ✅ Refresh token revocation on logout
- ✅ Token stored in MongoDB for server-side validation
- ✅ HttpOnly cookie support (can be configured)
- ✅ CORS protection
- ✅ Account activation/deactivation

---

## API Endpoints Summary

### Authentication Routes (`/api/auth`)

| Method | Endpoint           | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | `/register`        | Register new user          | No            |
| POST   | `/login`           | User login                 | No            |
| POST   | `/refresh-token`   | Get new access token       | No            |
| GET    | `/me`              | Get current user           | Yes           |
| PUT    | `/profile`         | Update user profile        | Yes           |
| POST   | `/change-password` | Change password            | Yes           |
| POST   | `/logout`          | Logout from current device | Yes           |
| POST   | `/logout-all`      | Logout from all devices    | Yes           |

### User Management Routes (`/api/users`)

| Method | Endpoint              | Description         | Auth Required | Role Required |
| ------ | --------------------- | ------------------- | ------------- | ------------- |
| GET    | `/`                   | Get all users       | Yes           | admin         |
| GET    | `/:id`                | Get user by ID      | Yes           | admin         |
| POST   | `/`                   | Create new user     | Yes           | admin         |
| PUT    | `/:id`                | Update user         | Yes           | admin         |
| DELETE | `/:id`                | Delete user         | Yes           | admin         |
| PATCH  | `/:id/toggle-status`  | Activate/deactivate | Yes           | admin         |
| PATCH  | `/:id/reset-password` | Reset password      | Yes           | admin         |
| PATCH  | `/:id/assign-role`    | Change user role    | Yes           | admin         |
| GET    | `/stats`              | Get user statistics | Yes           | admin         |

---

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "role": "doctor"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "doctor",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User (Protected Route)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Refresh Access Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

### Get All Users (Admin Only)

```bash
curl -X GET "http://localhost:5000/api/users?role=doctor&page=1&limit=10" \
  -H "Authorization: Bearer {adminAccessToken}"
```

### Create User (Admin)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {adminAccessToken}" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "role": "staff",
    "department": "Emergency"
  }'
```

### Update User Profile

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "phone": "+9876543210",
    "department": "Cardiology"
  }'
```

### Change Password

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword456",
    "confirmPassword": "NewPassword456"
  }'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

---

## Key Implementation Details

### Password Hashing

- Uses bcryptjs with 10 salt rounds
- Passwords are automatically hashed before saving to database
- Passwords are never returned in API responses

### Token Management

- **Access Token**: Contains userId and role, expires in 15 minutes
- **Refresh Token**: Contains userId and role, expires in 7 days
- Refresh tokens are stored in user document for server-side revocation
- Automatic cleanup of expired tokens (7 days)

### Role-Based Access Control

```javascript
// Example: Only admins can access this route
router.get("/", verifyAccessToken, authorize("admin"), controller);

// Multiple roles
router.get("/", verifyAccessToken, authorize("admin", "manager"), controller);
```

### Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "error": "Detailed error (in development)"
}
```

---

## Testing

### Manual Testing with Postman

1. Import the endpoints from the documentation
2. Create environment variables: `{{baseUrl}}`, `{{accessToken}}`, `{{refreshToken}}`
3. First register a user and save the tokens
4. Use tokens for protected routes
5. Test token refresh when access token expires

### Testing Token Expiration

1. Change JWT_SECRET in .env (all tokens become invalid)
2. Try to use old access token (should return 401)
3. Try to use old refresh token (should return 401)

---

## Troubleshooting

### "No access token provided" Error

- Make sure to include `Authorization: Bearer {token}` in headers
- Check that token is not expired (access token expires in 15 minutes)

### "Invalid email or password" During Login

- Verify email is registered
- Check password is correct (case-sensitive)
- Ensure user account is active (isActive = true)

### "Refresh token not found" Error

- Token was revoked after logout
- User logged in on another device and all tokens were cleared
- Need to login again to get new tokens

### "Access denied. Required role(s): admin"

- User doesn't have required role
- Ask admin to change user's role using `/api/users/:id/assign-role`

### MongoDB Connection Error

- Verify MONGODB_URI in .env is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database credentials are correct

---

## Security Checklist

- ✅ Use strong JWT_SECRET in production (at least 32 characters)
- ✅ Rotate JWT_SECRET periodically
- ✅ Use HTTPS in production (not HTTP)
- ✅ Set CORS_ORIGIN to specific frontend domain
- ✅ Store refresh tokens in HttpOnly cookies if possible
- ✅ Implement rate limiting on auth endpoints
- ✅ Log all authentication attempts
- ✅ Monitor for suspicious login patterns
- ✅ Implement 2FA for admin accounts (optional)

---

## Next Steps (Frontend Integration)

1. Store access token in memory
2. Store refresh token in HttpOnly cookie or secure storage
3. Add Authorization header to all API requests
4. Handle token expiration (401 responses)
5. Automatically refresh tokens when needed
6. Implement logout functionality
7. Add user profile page
8. Add role-based UI rendering

---

## Support

For issues or questions:

1. Check the [AUTH_API_DOCUMENTATION.md](./AUTH_API_DOCUMENTATION.md) for detailed endpoint information
2. Review error messages returned by the API
3. Check environment variables are set correctly
4. Verify JWT_SECRET is strong and consistent
5. Check MongoDB connection string

---

Version: 1.0.0
Last Updated: May 30, 2024
