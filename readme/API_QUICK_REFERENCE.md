## Hospital Manager - Quick API Reference

### Start Everything

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Convert Excel to CSV** (if needed)
   - Open `Report-2026-05-30.xlsx` in Excel
   - Save As → CSV (Comma delimited) → `hospitals.csv` (save in root)

3. **Import hospital data**
   ```bash
   npm run import
   ```
   This will stream the CSV and insert records in batches of 500.

4. **Start the server**
   ```bash
   npm start
   ```
   Server will run at `http://localhost:5000`

---

## Common API Examples

Use these with curl, Postman, or any HTTP client:

### 📊 VIEW DATA

**Get all hospitals (first 50)**
```bash
curl http://localhost:5000/api/hospitals
```

**Get specific page**
```bash
curl "http://localhost:5000/api/hospitals?page=2&limit=100"
```

**Get hospital by ID**
```bash
curl http://localhost:5000/api/hospitals/6123abc456def
```

**Get statistics**
```bash
curl http://localhost:5000/api/stats
```

---

### 🔍 FILTER & SEARCH

**Find all Government hospitals in Dhaka**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&type=Government"
```

**Find private hospitals in Chittagong**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Chittagong&private=true"
```

**Search by hospital name**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?name=Medical"
```

**Search by email**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?email=@gmail.com"
```

**Complex filter - multiple criteria**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&district=Dhaka&type=Private&page=1&limit=200"
```

---

### 📋 GET DROPDOWN VALUES

**Get all divisions**
```bash
curl http://localhost:5000/api/hospitals/distinct/division
```

**Get all districts**
```bash
curl http://localhost:5000/api/hospitals/distinct/district
```

**Get all hospital types**
```bash
curl http://localhost:5000/api/hospitals/distinct/type
```

**Get all agencies**
```bash
curl http://localhost:5000/api/hospitals/distinct/agency
```

**Get all upazilas**
```bash
curl http://localhost:5000/api/hospitals/distinct/upazila
```

---

### ➕ CREATE

**Add new hospital**
```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Medical Center",
    "nameBangla": "সিটি মেডিকেল সেন্টার",
    "code": 99999,
    "email": "contact@citymedical.bd",
    "agency": "Private",
    "type": "Private",
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila": "Mirpur",
    "private": true
  }'
```

---

### ✏️ UPDATE

**Update hospital information**
```bash
curl -X PUT http://localhost:5000/api/hospitals/6123abc456def \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@hospital.bd",
    "type": "Government"
  }'
```

---

### 🗑️ DELETE

**Delete specific hospital**
```bash
curl -X DELETE http://localhost:5000/api/hospitals/6123abc456def
```

**Delete all private hospitals in Dhaka**
```bash
curl -X DELETE "http://localhost:5000/api/hospitals/delete/by-filter?division=Dhaka&private=true"
```

**Delete all hospitals from a district**
```bash
curl -X DELETE "http://localhost:5000/api/hospitals/delete/by-filter?district=Narayanganj"
```

**Delete all hospitals (USE WITH CAUTION)**
```bash
curl -X DELETE "http://localhost:5000/api/hospitals/delete-all?confirm=yes-delete-all"
```

---

## Filter Parameters Reference

Use these with `/api/hospitals/filter/advanced`:

| Parameter | Type | Example |
|-----------|------|---------|
| `division` | string | Dhaka, Chittagong, Khulna |
| `district` | string | Dhaka, Narayanganj, Gazipur |
| `upazila` | string | Mirpur, Gulshan, Dhanmondi |
| `type` | string | Government, Private, NGO |
| `agency` | string | DGHS, WHO, etc. |
| `private` | boolean | true, false |
| `name` | string | Any partial hospital name |
| `email` | string | Any partial email |
| `page` | number | 1, 2, 3, ... |
| `limit` | number | 50, 100, 200, ... |

---

## Key Features

✅ **Stream-based CSV import** - No memory overflow, handles 40k+ records
✅ **Batch processing** - 500 records inserted at a time
✅ **Progress tracking** - Console logs show import progress
✅ **Advanced filtering** - Filter by any combination of criteria
✅ **Search functionality** - Search by name or email
✅ **Statistics** - Get insights by type and division
✅ **Pagination** - Handle large result sets
✅ **Error handling** - Graceful error messages
✅ **Data validation** - Mongoose schema validation
✅ **Indexing** - Fast queries on frequently used fields

---

## Troubleshooting Tips

| Issue | Solution |
|-------|----------|
| "CSV file not found" | Ensure `hospitals.csv` is in root directory |
| "MongoDB Connection Error" | Check `.env` file has correct MONGODB_URI |
| Import takes too long | Normal for 40k records; be patient (2-3 min) |
| "Duplicate key error" | Hospital Code must be unique; check CSV for duplicates |
| Server won't start | Check if port 5000 is already in use, or set `PORT` in `.env` |
| Can't connect to API | Ensure server is running (`npm start`) |

---

## Tips for Production

1. **Backup before delete operations** - Always backup MongoDB before bulk deletes
2. **Use pagination** - Don't fetch all 40k records at once
3. **Add authentication** - Consider adding JWT tokens to routes
4. **Rate limiting** - Add rate limiting middleware for public APIs
5. **Logging** - Implement proper logging instead of console.log
6. **Error handling** - Wrap API calls with try-catch
7. **Input validation** - Validate all query parameters
8. **Use indexes** - Already indexed on: division, district, upazila, type, agency, private, code

---

## Need More Info?

View full API documentation:
```bash
curl http://localhost:5000/api/docs
```

Check README.md for detailed setup and project structure.
