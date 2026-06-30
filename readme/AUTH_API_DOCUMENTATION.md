# Authentication & User Management API Documentation

## Overview

Complete authentication and authorization system with JWT-based access and refresh tokens.

---

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "user",
  "department": "Cardiology"
}
```

**Response (201 Created):**

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
      "phone": "+1234567890",
      "role": "user",
      "department": "Cardiology",
      "isActive": true,
      "createdAt": "2024-05-30T12:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Possible Errors:**

- 400: Missing required fields
- 409: Email already registered
- 500: Server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": "2024-05-30T12:15:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Possible Errors:**

- 400: Missing email or password
- 401: Invalid credentials
- 403: User account inactive
- 500: Server error

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Generate a new access token using refresh token

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Possible Errors:**

- 400: Missing refresh token
- 401: Invalid or expired refresh token
- 401: Refresh token not found
- 500: Server error

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Retrieve current authenticated user's profile

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "department": "Cardiology",
      "isActive": true,
      "createdAt": "2024-05-30T12:00:00Z"
    }
  }
}
```

**Possible Errors:**

- 401: No token or invalid token
- 401: Token expired
- 404: User not found
- 500: Server error

---

### 5. Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Description:** Update user's profile information

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "department": "Neurology"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "department": "Neurology",
      "isActive": true
    }
  }
}
```

---

### 6. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change user's password

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Possible Errors:**

- 400: Missing required fields or password mismatch
- 400: Password must be at least 6 characters
- 401: Current password is incorrect
- 404: User not found
- 500: Server error

---

### 7. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout from current device (invalidate refresh token)

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 8. Logout From All Devices

**Endpoint:** `POST /api/auth/logout-all`

**Description:** Logout from all devices (invalidate all refresh tokens)

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## User Management Endpoints (Admin Only)

All user management endpoints require:

- Valid access token with admin role
- Admin authorization

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Description:** Retrieve list of all users with pagination

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `role` (optional): Filter by role (admin, staff, doctor, manager, user)
- `isActive` (optional): Filter by status (true/false)
- `department` (optional): Filter by department
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**

```
GET /api/users?role=doctor&isActive=true&page=1&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "doctor",
        "department": "Cardiology",
        "isActive": true,
        "createdAt": "2024-05-30T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Description:** Retrieve specific user's details

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "doctor",
      "department": "Cardiology",
      "isActive": true,
      "lastLogin": "2024-05-30T12:15:00Z",
      "createdAt": "2024-05-30T12:00:00Z"
    }
  }
}
```

---

### 3. Create User (Admin)

**Endpoint:** `POST /api/users`

**Description:** Create a new user account (Admin only)

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "doctor",
  "department": "Pediatrics",
  "hospitalId": "507f1f77bcf86cd799439011"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "doctor",
      "department": "Pediatrics",
      "isActive": true
    }
  }
}
```

---

### 4. Update User (Admin)

**Endpoint:** `PUT /api/users/:id`

**Description:** Update user information

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Johnson",
  "phone": "+9876543210",
  "role": "manager",
  "department": "Administration",
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Jane",
      "lastName": "Johnson",
      "email": "jane@example.com",
      "phone": "+9876543210",
      "role": "manager",
      "department": "Administration",
      "isActive": true
    }
  }
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Description:** Delete a user account

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** Cannot delete the last admin user

---

### 6. Toggle User Status

**Endpoint:** `PATCH /api/users/:id/toggle-status`

**Description:** Activate or deactivate a user

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isActive": false
    }
  }
}
```

---

### 7. Reset User Password (Admin)

**Endpoint:** `PATCH /api/users/:id/reset-password`

**Description:** Reset user's password (clears all refresh tokens)

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "newPassword": "temporaryPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User password reset successfully"
}
```

---

### 8. Assign Role

**Endpoint:** `PATCH /api/users/:id/assign-role`

**Description:** Assign or change user's role

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "role": "manager"
}
```

**Valid Roles:** `admin`, `staff`, `doctor`, `manager`, `user`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "manager",
      "isActive": true
    }
  }
}
```

---

### 9. Get User Statistics

**Endpoint:** `GET /api/users/stats`

**Description:** Get user statistics and analytics

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 145,
    "inactiveUsers": 5,
    "usersByRole": {
      "admin": 3,
      "manager": 15,
      "doctor": 50,
      "staff": 70,
      "user": 12
    }
  }
}
```

---

## JWT Token Information

### Access Token

- **Expiration:** 15 minutes
- **Use:** For authenticating API requests
- **Format:** Include in Authorization header as `Bearer {accessToken}`

### Refresh Token

- **Expiration:** 7 days
- **Use:** For obtaining new access tokens without re-login
- **Storage:** Stored in user's refreshTokens array in database

### Token Structure

All JWT tokens contain:

- `userId`: User's MongoDB ObjectId
- `role`: User's role (admin, staff, doctor, manager, user)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Invalid access token",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Access denied. Required role(s): admin",
  "code": "FORBIDDEN"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "User not found",
  "code": "NOT_FOUND"
}
```

**409 Conflict:**

```json
{
  "success": false,
  "message": "Email already registered",
  "code": "CONFLICT"
}
```

**500 Server Error:**

```json
{
  "success": false,
  "message": "Error registering user",
  "error": "Error details here"
}
```

---

## Implementation Notes

### Security Recommendations

1. **JWT Secret:** Use a strong, random secret key in production
2. **Token Expiration:** Access tokens expire in 15 minutes for security
3. **Refresh Tokens:** Stored in database for server-side revocation
4. **Password Hashing:** All passwords hashed with bcrypt before storage
5. **HTTPS:** Always use HTTPS in production
6. **CORS:** Configure CORS_ORIGIN to restrict access

### Best Practices

1. **Store Tokens:**
   - Access token: In memory or short-lived cookies
   - Refresh token: HttpOnly cookies (recommended) or secure storage

2. **Handle Token Expiration:**
   - Catch 401 responses with `code: "TOKEN_EXPIRED"`
   - Automatically call refresh-token endpoint
   - Retry original request with new access token

3. **User Roles & Permissions:**
   - admin: Full access to all resources
   - manager: Can manage staff and view reports
   - doctor: Can view patients and update records
   - staff: Can view general data
   - user: Can only view own data

---

## Example Usage Flow

### Registration & Login Flow

1. User calls `/api/auth/register` with credentials
2. Server creates user and returns tokens
3. Frontend stores tokens
4. User can now access protected routes with access token

### Token Refresh Flow

1. Access token expires (15 minutes)
2. API returns 401 with `code: "TOKEN_EXPIRED"`
3. Frontend calls `/api/auth/refresh-token` with refresh token
4. Server validates refresh token and returns new access token
5. Frontend retries original request with new token

### Logout Flow

1. User clicks logout
2. Frontend calls `/api/auth/logout` with refresh token and access token
3. Server removes refresh token from database
4. Frontend clears stored tokens
5. User is logged out

---

## Database Models

### User Model

```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  phone: String (optional),
  role: String (enum: admin, staff, doctor, manager, user),
  department: String (optional),
  hospitalId: ObjectId (ref: Hospital),
  isActive: Boolean (default: true),
  refreshTokens: [
    {
      token: String,
      createdAt: Date (expires: 7 days)
    }
  ],
  lastLogin: Date (optional),
  profilePicture: String (optional),
  permissions: [String] (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Testing the API

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Get Current User:**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {accessToken}"
```

**Refresh Token:**

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

---

## Dependencies

- **express:** Web framework
- **mongoose:** MongoDB ODM
- **jsonwebtoken:** JWT signing and verification
- **bcryptjs:** Password hashing
- **cors:** Cross-origin resource sharing
- **dotenv:** Environment variable management

---

## Version

Current API Version: 1.0.0
Last Updated: May 30, 2024
