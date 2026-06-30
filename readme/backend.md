# Hospital Manager

A Node.js application for managing hospital records with MongoDB using Mongoose. Features CSV import, batch processing, and comprehensive REST API with filtering capabilities.

## Features

✅ **CSV Import**: Stream-based import for large CSV files (40k+ records)
✅ **Batch Processing**: Insert 500 records at a time to prevent memory overflow
✅ **Filtering**: Advanced filtering by division, district, upazila, type, agency, and more
✅ **Search**: Search by name and email
✅ **Statistics**: Get hospital statistics by type and division
✅ **CRUD Operations**: Create, read, update, delete hospitals
✅ **Pagination**: Built-in pagination for large result sets

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. **Clone or download this project**

2. **Install dependencies**
```bash
npm install
```

This will install:
- `mongoose`: MongoDB object modeling
- `express`: Web framework
- `dotenv`: Environment variable management
- `csv-parser`: CSV parsing for streaming data
- `nodemon`: Auto-reload during development (optional)

## Setup

### 1. Prepare Your CSV File

Convert your Excel file to CSV format:
- Open `Report-2026-05-30.xlsx` in Excel
- Save As → CSV (Comma delimited) → `hospitals.csv`
- Place `hospitals.csv` in the root directory

**Expected CSV Headers:**
```
Name, Name (Bangla), Code, Email, Agency, Type, Division, District, City Corporation, Upazila, Paurasava, Union, Private
```

### 2. Configure .env File

Your `.env` file is already configured with:
```
MONGODB_URI=mongodb+srv://zaforchishti_db_user:69675277@techmed.jhtky9l.mongodb.net/?appName=TechMed
```

(Already set in your project)

## Usage

### Import Hospital Data from CSV

```bash
npm run import
```

**Output Example:**
```
🚀 Starting Hospital Data Import...

✓ MongoDB Connected
✓ Processed 500 records | Batch inserted successfully
✓ Processed 1000 records | Batch inserted successfully
✓ Processed 1500 records | Batch inserted successfully
...
✓ Processed 39419 records | Final batch inserted

✓ Import completed! Total records processed: 39419

📊 Summary: 39419 hospital records imported successfully
✓ Database connection closed
```

### Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

**Output:**
```
✓ Server running on http://localhost:5000
✓ API Docs available at http://localhost:5000/api/docs
```

## API Endpoints

### Documentation
- **GET** `/api/docs` - View all available endpoints

### Retrieve Hospitals
- **GET** `/api/hospitals` - Get all hospitals (paginated)
  - Query: `?page=1&limit=50`
  
- **GET** `/api/hospitals/:id` - Get hospital by MongoDB ID

- **GET** `/api/hospitals/filter/advanced` - Advanced filtering
  - Query filters: `?division=Dhaka&district=Dhaka&type=Government&private=false`
  
- **GET** `/api/hospitals/distinct/:field` - Get distinct values
  - Fields: `division`, `district`, `upazila`, `type`, `agency`
  
- **GET** `/api/stats` - Get hospital statistics

### Create Hospital
- **POST** `/api/hospitals` - Create new hospital
  - Body: Hospital data as JSON

### Update Hospital
- **PUT** `/api/hospitals/:id` - Update hospital by ID
  - Body: Fields to update

### Delete Hospitals
- **DELETE** `/api/hospitals/:id` - Delete hospital by ID

- **DELETE** `/api/hospitals/delete/by-filter` - Delete by criteria
  - Query: `?division=Dhaka&private=true`
  
- **DELETE** `/api/hospitals/delete-all` - Delete all hospitals (confirm with `?confirm=yes-delete-all`)

## Example API Usage

### Get all hospitals in Dhaka division (Government)
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&type=Government&page=1&limit=100"
```

### Search hospitals by name
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?name=Medical&page=1&limit=50"
```

### Get statistics
```bash
curl "http://localhost:5000/api/stats"
```

### Create new hospital
```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Hospital",
    "code": 99999,
    "type": "Private",
    "division": "Dhaka",
    "private": true
  }'
```

### Delete hospitals from a specific district
```bash
curl -X DELETE "http://localhost:5000/api/hospitals/delete/by-filter?district=Narayanganj&private=true"
```

## Database Schema

### Hospital Collection Fields
| Field | Type | Description |
|-------|------|-------------|
| name | String | Hospital name (English) |
| nameBangla | String | Hospital name (Bengali) |
| code | Number | Unique hospital code |
| email | String | Hospital email |
| agency | String | Governing agency |
| type | String | Hospital type (e.g., Government, Private) |
| division | String | Administrative division |
| district | String | District name |
| cityCorporation | String | City corporation name |
| upazila | String | Upazila name |
| paurasava | String | Paurasava name |
| union | String | Union name |
| private | Boolean | Private/Public indicator |
| timestamps | Date | createdAt, updatedAt |

## Troubleshooting

### "CSV file not found"
- Ensure `hospitals.csv` is in the root directory
- Check file spelling and format

### "MongoDB Connection Error"
- Verify `MONGODB_URI` in `.env` file
- Check internet connection
- Ensure MongoDB Atlas IP whitelist includes your IP

### "Batch insertion error"
- Check CSV file format (must have correct headers)
- Verify data types (Code should be numeric, Private should be 0 or 1)
- Check for duplicate Code values

### Memory issues with large imports
- The script uses streaming to handle 40k+ records
- If still experiencing issues, reduce BATCH_SIZE in `importHospitals.js` from 500 to 250

## Development

### Project Structure
```
Hospital-Manager/
├── models/
│   └── Hospital.js          # Mongoose schema
├── utils/
│   └── databaseConnection.js # DB connection utility
├── server.js                 # Express server with API routes
├── importHospitals.js        # CSV import script
├── package.json              # Dependencies
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
└── README.md                # This file
```

### Key Features Explained

**Streaming CSV Import**
- Uses `fs.createReadStream()` to read file in chunks
- Prevents memory overflow with 40,000+ records
- Batches inserts in groups of 500

**Data Cleaning**
- Converts Private field (0/1) to Boolean (true/false)
- Handles empty fields gracefully
- Validates data types

**Advanced Filtering**
- Multiple filter criteria support
- Case-insensitive name search
- Regex-based email search
- Distinct value queries for dropdowns

## Performance

- **Import Time**: ~2-3 minutes for 40,000 records
- **Batch Size**: 500 records per insert (configurable)
- **Memory Usage**: Streaming keeps memory constant regardless of file size
- **Query Performance**: Indexed fields for fast lookups

## License

ISC

## Support

For issues or questions, check the API documentation at `/api/docs` while the server is running.
