# 🏥 Hospital Manager API - Complete Documentation

A comprehensive REST API backend for managing hospital data with advanced filtering, statistics, and data management capabilities. Built with **Express.js**, **MongoDB**, and **Mongoose**.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Installation & Setup](#installation--setup)
7. [Environment Variables](#environment-variables)
8. [Running the Server](#running-the-server)
9. [API Usage Examples](#api-usage-examples)
10. [Error Handling](#error-handling)
11. [CORS Configuration](#cors-configuration)
12. [Features](#features)

---

## 🎯 Project Overview

The Hospital Manager API is a robust backend system that provides complete CRUD operations for hospital data management. It's designed to handle:

- **39,419+ hospital records** from Bangladesh
- Advanced filtering by location, type, and agency
- Statistical analysis and reporting
- Full RESTful API with pagination support
- Error handling and CORS support

**Primary Use Case:** Manage and query hospital information across Bangladesh including details about government, private, and community hospitals organized by division, district, and upazila.

---

## 🛠 Tech Stack

| Layer           | Technology | Version |
| --------------- | ---------- | ------- |
| **Runtime**     | Node.js    | v14+    |
| **Framework**   | Express.js | 4.18.2  |
| **Database**    | MongoDB    | 7.2.0   |
| **ODM**         | Mongoose   | 7.5.0   |
| **CORS**        | cors       | 2.8.5   |
| **CSV Parsing** | csv-parser | 3.0.0   |
| **Environment** | dotenv     | 16.3.1  |
| **Development** | nodemon    | 3.1.14  |

---

## 📁 Project Structure

```
Hospital-Manager/
├── server.js                          # Main Express server
├── importHospitals.js                 # CSV import script
├── package.json                       # Dependencies & scripts
├── .env                               # Environment variables (MongoDB URI, CORS origin, PORT)
├── .env.example                       # Template for environment variables
├── .gitignore                         # Git ignore file
├── hospitals.csv                      # CSV data source
├── controllers/
│   └── hospitalController.js          # Business logic for all endpoints
├── middleware/
│   └── errorHandler.js                # Global error handling middleware
├── models/
│   └── Hospital.js                    # Mongoose schema definition
├── routes/
│   └── hospitalRoutes.js              # Route definitions
└── utils/
    └── databaseConnection.js          # MongoDB connection setup
```

---

## 🗄 Database Schema

### Hospital Model

```javascript
{
  name: {
    type: String,
    required: true,
    indexed: true
  },
  nameBangla: {
    type: String,
    required: false
  },
  code: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false
  },
  agency: {
    type: String,
    required: false,
    indexed: true
  },
  type: {
    type: String,
    required: false,
    indexed: true
  },
  division: {
    type: String,
    required: false,
    indexed: true
  },
  district: {
    type: String,
    required: false,
    indexed: true
  },
  cityCorporation: {
    type: String,
    required: false
  },
  upazila: {
    type: String,
    required: false,
    indexed: true
  },
  paurasava: {
    type: String,
    required: false
  },
  union: {
    type: String,
    required: false
  },
  private: {
    type: Boolean,
    required: false,
    default: false,
    indexed: true
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:5000/api/hospitals
```

### Health Check

- **GET** `/health`
  - Returns: `{ success: true, message: "Server is running" }`
  - No authentication required

---

## 📖 GET Endpoints

### 1. Get All Hospitals (with Pagination)

```http
GET /api/hospitals
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Records per page (max: 100)

**Example Request:**

```
GET /api/hospitals?page=1&limit=50
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "total": 39419,
  "totalPages": 789,
  "data": [
    {
      "_id": "66592abc123def456",
      "name": "Dhaka Medical College Hospital",
      "nameBangla": "ঢাকা মেডিকেল কলেজ হাসপাতাল",
      "code": 101,
      "email": "dmch@example.com",
      "agency": "Government",
      "type": "Medical College Hospital",
      "division": "Dhaka",
      "district": "Dhaka",
      "cityCorporation": "Dhaka City",
      "upazila": "Dhaka Sadar",
      "paurasava": null,
      "union": null,
      "private": false,
      "createdAt": "2026-05-30T10:20:30.000Z",
      "updatedAt": "2026-05-30T10:20:30.000Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Get Hospital by ID

```http
GET /api/hospitals/:id
```

**Parameters:**

- `id` (required) - MongoDB ObjectId of the hospital

**Example Request:**

```
GET /api/hospitals/66592abc123def456
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "66592abc123def456",
    "name": "Dhaka Medical College Hospital",
    "nameBangla": "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    "code": 101,
    "email": "dmch@example.com",
    "agency": "Government",
    "type": "Medical College Hospital",
    "division": "Dhaka",
    "district": "Dhaka",
    "cityCorporation": "Dhaka City",
    "upazila": "Dhaka Sadar",
    "paurasava": null,
    "union": null,
    "private": false,
    "createdAt": "2026-05-30T10:20:30.000Z",
    "updatedAt": "2026-05-30T10:20:30.000Z"
  }
}
```

**Status Codes:**

- `200 OK` - Hospital found
- `404 Not Found` - Hospital not found
- `500 Internal Server Error` - Server error

---

### 3. Filter Hospitals (Advanced)

```http
GET /api/hospitals/filter/advanced
```

**Query Parameters (all optional, can be combined):**

- `division` - Filter by division (e.g., "Dhaka", "Chittagong")
- `district` - Filter by district
- `upazila` - Filter by upazila
- `type` - Filter by hospital type
- `agency` - Filter by agency (e.g., "Government", "NGO")
- `private` - Filter by private status ("true" or "false")
- `name` - Search by hospital name (case-insensitive)
- `email` - Search by email (case-insensitive)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 50)

**Example Requests:**

All government hospitals in Dhaka division:

```
GET /api/hospitals/filter/advanced?division=Dhaka&agency=Government
```

Private hospitals in specific upazila with pagination:

```
GET /api/hospitals/filter/advanced?upazila=Dhaka%20Sadar&private=true&page=1&limit=20
```

Search by name:

```
GET /api/hospitals/filter/advanced?name=Medical&division=Dhaka
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "total": 145,
  "totalPages": 3,
  "appliedFilters": {
    "division": "Dhaka",
    "private": false
  },
  "data": [
    {
      "_id": "66592abc123def456",
      "name": "Dhaka Medical College Hospital",
      "nameBangla": "ঢাকা মেডিকেল কলেজ হাসপাতাল",
      "code": 101,
      "email": "dmch@example.com",
      "agency": "Government",
      "type": "Medical College Hospital",
      "division": "Dhaka",
      "district": "Dhaka",
      "upazila": "Dhaka Sadar",
      "private": false,
      "createdAt": "2026-05-30T10:20:30.000Z",
      "updatedAt": "2026-05-30T10:20:30.000Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 4. Get Distinct Values for a Field

```http
GET /api/hospitals/distinct/:field
```

**Parameters:**

- `field` (required) - Must be one of: `division`, `district`, `upazila`, `type`, `agency`

**Example Requests:**

Get all divisions:

```
GET /api/hospitals/distinct/division
```

Get all hospital types:

```
GET /api/hospitals/distinct/type
```

Get all upazilas:

```
GET /api/hospitals/distinct/upazila
```

**Response:**

```json
{
  "success": true,
  "field": "division",
  "count": 8,
  "data": [
    "Barisal",
    "Chittagong",
    "Dhaka",
    "Khulna",
    "Mymensingh",
    "Rajshahi",
    "Rangpur",
    "Sylhet"
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid field name
- `500 Internal Server Error` - Server error

---

### 5. Get Statistics

```http
GET /api/hospitals/stats
```

**Example Request:**

```
GET /api/hospitals/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHospitals": 39419,
    "privateHospitals": 8234,
    "publicHospitals": 31185,
    "byType": [
      {
        "_id": "Private Hospital",
        "count": 8234
      },
      {
        "_id": "Government Hospital",
        "count": 15621
      },
      {
        "_id": "NGO Hospital",
        "count": 4567
      },
      {
        "_id": "Medical College Hospital",
        "count": 2349
      }
    ],
    "byDivision": [
      {
        "_id": "Dhaka",
        "count": 9234
      },
      {
        "_id": "Chittagong",
        "count": 5678
      },
      {
        "_id": "Khulna",
        "count": 3456
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 6. Get API Documentation

```http
GET /api/hospitals/docs
```

**Response:** Returns this documentation

---

## ➕ POST Endpoints

### Create a New Hospital

```http
POST /api/hospitals
```

**Request Body:**

```json
{
  "name": "New Hospital Name",
  "nameBangla": "নতুন হাসপাতালের নাম",
  "code": 9999,
  "email": "hospital@example.com",
  "agency": "Private",
  "type": "Private Hospital",
  "division": "Dhaka",
  "district": "Dhaka",
  "cityCorporation": "Dhaka City",
  "upazila": "Dhaka Sadar",
  "paurasava": null,
  "union": null,
  "private": true
}
```

**Required Fields:**

- `name` (string)
- `code` (number, must be unique)

**Optional Fields:**

- `nameBangla`, `email`, `agency`, `type`, `division`, `district`, `cityCorporation`, `upazila`, `paurasava`, `union`
- `private` (boolean, default: false)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "66592abc123def789",
    "name": "New Hospital Name",
    "nameBangla": "নতুন হাসপাতালের নাম",
    "code": 9999,
    "email": "hospital@example.com",
    "agency": "Private",
    "type": "Private Hospital",
    "division": "Dhaka",
    "district": "Dhaka",
    "cityCorporation": "Dhaka City",
    "upazila": "Dhaka Sadar",
    "paurasava": null,
    "union": null,
    "private": true,
    "createdAt": "2026-05-30T12:30:00.000Z",
    "updatedAt": "2026-05-30T12:30:00.000Z"
  }
}
```

**Status Codes:**

- `201 Created` - Hospital created successfully
- `400 Bad Request` - Validation error (duplicate code, missing required fields)
- `500 Internal Server Error` - Server error

---

## ✏️ PUT Endpoints

### Update Hospital by ID

```http
PUT /api/hospitals/:id
```

**Parameters:**

- `id` (required) - MongoDB ObjectId of the hospital

**Request Body:** (partial update, include only fields to update)

```json
{
  "name": "Updated Hospital Name",
  "email": "newemail@example.com",
  "type": "Medical College Hospital",
  "private": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "66592abc123def789",
    "name": "Updated Hospital Name",
    "nameBangla": "নতুন হাসপাতালের নাম",
    "code": 9999,
    "email": "newemail@example.com",
    "agency": "Private",
    "type": "Medical College Hospital",
    "division": "Dhaka",
    "district": "Dhaka",
    "cityCorporation": "Dhaka City",
    "upazila": "Dhaka Sadar",
    "paurasava": null,
    "union": null,
    "private": false,
    "createdAt": "2026-05-30T12:30:00.000Z",
    "updatedAt": "2026-05-30T13:45:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK` - Hospital updated successfully
- `404 Not Found` - Hospital not found
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error

---

## 🗑️ DELETE Endpoints

### Delete Hospital by ID

```http
DELETE /api/hospitals/:id
```

**Parameters:**

- `id` (required) - MongoDB ObjectId of the hospital

**Response:**

```json
{
  "success": true,
  "message": "Hospital deleted successfully",
  "data": {
    "_id": "66592abc123def789",
    "name": "Deleted Hospital Name",
    "code": 9999,
    "email": "hospital@example.com",
    "private": true
  }
}
```

**Status Codes:**

- `200 OK` - Hospital deleted successfully
- `404 Not Found` - Hospital not found
- `500 Internal Server Error` - Server error

---

### Delete Hospitals by Filter

```http
DELETE /api/hospitals/delete/by-filter
```

**Query Parameters (at least one required):**

- `division`, `district`, `upazila`, `type`, `agency`, `private`

**Example Requests:**

Delete all private hospitals in Dhaka:

```
DELETE /api/hospitals/delete/by-filter?division=Dhaka&private=true
```

Delete all NGO hospitals:

```
DELETE /api/hospitals/delete/by-filter?agency=NGO
```

**Response:**

```json
{
  "success": true,
  "message": "25 hospitals deleted successfully",
  "deletedCount": 25
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### Delete All Hospitals ⚠️ (USE WITH CAUTION)

```http
DELETE /api/hospitals/delete-all
```

**⚠️ WARNING:** This will delete ALL hospitals from the database. Use only for testing or data reset.

**Response:**

```json
{
  "success": true,
  "message": "All hospitals deleted successfully",
  "deletedCount": 39419
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

## 📦 Installation & Setup

### 1. Prerequisites

- Node.js v14 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 2. Clone/Setup Project

```bash
# Navigate to project directory
cd Hospital-Manager

# Install dependencies
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=YourAppName

# Server
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Import Data (Optional)

If you have a CSV file with hospital data:

```bash
npm run import
```

**Note:** CSV file should be named `hospitals.csv` and placed in the root directory.

### 5. Run Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Expected output:

```
✓ Server running on http://localhost:5000
✓ API Docs available at http://localhost:5000/api/hospitals/docs
✓ CORS enabled
```

---

## 🔐 Environment Variables

| Variable      | Description               | Example                                                    |
| ------------- | ------------------------- | ---------------------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=App` |
| `PORT`        | Server port               | `5000`                                                     |
| `CORS_ORIGIN` | Frontend origin for CORS  | `http://localhost:3000`                                    |
| `NODE_ENV`    | Environment               | `development` or `production`                              |

---

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

- Runs with nodemon (auto-reload on file changes)
- Better for development

### Production Mode

```bash
npm start
```

- Direct Node.js execution
- Better for production

### Health Check

```bash
curl http://localhost:5000/health
```

### Root Endpoint

```bash
curl http://localhost:5000
```

---

## 💡 API Usage Examples

### JavaScript (Fetch API)

**Get all hospitals:**

```javascript
fetch("http://localhost:5000/api/hospitals?page=1&limit=50")
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

**Filter hospitals:**

```javascript
const filters = {
  division: "Dhaka",
  private: false,
  page: 1,
  limit: 20,
};

const queryString = new URLSearchParams(filters).toString();
fetch(`http://localhost:5000/api/hospitals/filter/advanced?${queryString}`)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

**Get statistics:**

```javascript
fetch("http://localhost:5000/api/hospitals/stats")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

**Create a hospital:**

```javascript
const newHospital = {
  name: "New Hospital",
  code: 9999,
  division: "Dhaka",
  private: false,
};

fetch("http://localhost:5000/api/hospitals", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newHospital),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

**Update a hospital:**

```javascript
const hospitalId = "66592abc123def456";
const updates = {
  name: "Updated Name",
  email: "newemail@example.com",
};

fetch(`http://localhost:5000/api/hospitals/${hospitalId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updates),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

**Delete a hospital:**

```javascript
const hospitalId = "66592abc123def456";

fetch(`http://localhost:5000/api/hospitals/${hospitalId}`, {
  method: "DELETE",
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### React Example

```javascript
import { useEffect, useState } from "react";

function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/hospitals?limit=50",
        );
        const data = await response.json();
        setHospitals(data.data);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {hospitals.map((hospital) => (
        <li key={hospital._id}>{hospital.name}</li>
      ))}
    </ul>
  );
}

export default HospitalList;
```

### cURL Examples

**Get all hospitals:**

```bash
curl http://localhost:5000/api/hospitals
```

**Filter by division:**

```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&private=false"
```

**Get statistics:**

```bash
curl http://localhost:5000/api/hospitals/stats
```

**Create hospital:**

```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Hospital",
    "code": 9999,
    "division": "Dhaka",
    "private": false
  }'
```

**Update hospital:**

```bash
curl -X PUT http://localhost:5000/api/hospitals/66592abc123def456 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

**Delete hospital:**

```bash
curl -X DELETE http://localhost:5000/api/hospitals/66592abc123def456
```

---

## ❌ Error Handling

The API includes comprehensive error handling. All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes

| Code  | Meaning      | Example                                |
| ----- | ------------ | -------------------------------------- |
| `200` | OK           | Successful GET, PUT, DELETE            |
| `201` | Created      | Successful POST                        |
| `400` | Bad Request  | Invalid query params, validation error |
| `404` | Not Found    | Hospital ID not found                  |
| `500` | Server Error | Database error, connection error       |

### Error Examples

**Invalid Field in Distinct:**

```json
{
  "success": false,
  "error": "Invalid field. Allowed fields: division, district, upazila, type, agency"
}
```

**Hospital Not Found:**

```json
{
  "success": false,
  "error": "Hospital not found"
}
```

**Duplicate Code (POST):**

```json
{
  "success": false,
  "error": "E11000 duplicate key error collection: hospitals.code"
}
```

---

## 🔀 CORS Configuration

CORS (Cross-Origin Resource Sharing) is enabled for frontend integration.

### Current Configuration:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
```

### Customizing CORS:

To restrict CORS to specific frontend URLs, update `.env`:

```env
# Allow only your React app
CORS_ORIGIN=http://localhost:3000

# Or allow multiple origins
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### For Multiple Origins:

Update `server.js`:

```javascript
const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // ... rest of config
};
```

---

## ✨ Features

- ✅ **Full CRUD Operations** - Create, read, update, delete hospitals
- ✅ **Advanced Filtering** - Filter by multiple criteria (division, district, upazila, type, agency, private status)
- ✅ **Search Functionality** - Search by name and email (case-insensitive)
- ✅ **Pagination** - Paginated results with configurable page size
- ✅ **Statistics** - Hospital counts by type and division
- ✅ **Distinct Values** - Get unique values for dropdown filters
- ✅ **MongoDB Indexing** - Optimized database queries with indexes
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **CORS Support** - Configured for frontend integration
- ✅ **Request Logging** - Automatic request logging
- ✅ **Data Validation** - Mongoose schema validation
- ✅ **CSV Import** - Bulk import from CSV with batching
- ✅ **Timestamps** - Automatic createdAt/updatedAt tracking

---

## 🔗 Database Indexes

For optimal query performance, the following fields are indexed:

- `name` - For hospital name searches
- `code` - Unique index for hospital code
- `agency` - For agency filtering
- `type` - For hospital type filtering
- `division` - For division filtering
- `district` - For district filtering
- `upazila` - For upazila filtering
- `private` - For private/public filtering

---

## 📊 Data Statistics

- **Total Hospitals:** 39,419+
- **Divisions:** 8
- **Hospital Types:** Multiple (Government, Private, NGO, Medical College, etc.)
- **Fields per Hospital:** 13 core fields + MongoDB metadata

---

## 🔄 Workflow Examples

### Frontend Integration Workflow

1. **Initialize Data on App Load:**

   ```javascript
   // Get all distinct values for filters
   const divisions = await fetch("/api/hospitals/distinct/division");
   const types = await fetch("/api/hospitals/distinct/type");
   const agencies = await fetch("/api/hospitals/distinct/agency");
   ```

2. **Load Hospitals:**

   ```javascript
   // Get hospitals with initial pagination
   const hospitals = await fetch("/api/hospitals?page=1&limit=20");
   ```

3. **Filter Hospitals:**

   ```javascript
   // Apply user filters
   const filtered = await fetch(
     "/api/hospitals/filter/advanced?division=Dhaka&type=Government&page=1&limit=20",
   );
   ```

4. **View Hospital Details:**

   ```javascript
   // Get specific hospital
   const hospital = await fetch(`/api/hospitals/${hospitalId}`);
   ```

5. **Get Dashboard Stats:**
   ```javascript
   // Display statistics
   const stats = await fetch("/api/hospitals/stats");
   ```

---

## 🔒 Security Notes

- No authentication/authorization implemented (add as needed)
- MongoDB URI should be kept secret in `.env`
- CORS is open by default (restrict in production)
- Input validation via Mongoose schema
- SQL injection not applicable (MongoDB with Mongoose ODM)

---

## 📝 Development Notes

- All timestamps are in UTC
- MongoDB uses ObjectId for document IDs
- Pagination defaults to page 1 with limit 50
- Filter parameters are case-sensitive except for name and email search
- Private boolean is auto-converted from 0/1 in POST/PUT requests

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"

- Check `MONGODB_URI` in `.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check internet connection

### "CORS error in frontend"

- Update `CORS_ORIGIN` in `.env`
- Restart server after changing `.env`
- Check frontend URL matches `CORS_ORIGIN` exactly

### "Hospital not found" when using correct ID

- Verify ObjectId format is correct
- Check if hospital was deleted
- Verify database connection

### "Duplicate key error on POST"

- Code already exists (code must be unique)
- Use a different code value

---

## 📞 Support & Documentation

- **API Root:** `http://localhost:5000`
- **Health Check:** `GET /health`
- **Documentation:** `GET /api/hospitals/docs`
- **Base API URL:** `http://localhost:5000/api/hospitals`

---

## 📜 License

ISC

---

## 👤 Author

Created as a backend system for Hospital Manager application.

---

**Last Updated:** May 30, 2026

For any questions or issues, refer to the API endpoints documentation above or check server logs for detailed error messages.
