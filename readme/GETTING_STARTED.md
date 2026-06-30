# 🚀 Hospital Manager - Getting Started Guide

## What's Been Created

Your Hospital Manager project now includes:

### Core Application Files
- **`server.js`** - Express server with comprehensive REST API
- **`importHospitals.js`** - CSV import script with streaming & batching
- **`models/Hospital.js`** - Mongoose schema definition
- **`utils/databaseConnection.js`** - Database connection utility

### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`.env`** - Your MongoDB connection (already configured)
- **`.env.example`** - Template for environment variables
- **`.gitignore`** - Files to ignore in Git

### Documentation
- **`README.md`** - Full project documentation
- **`API_QUICK_REFERENCE.md`** - Common API examples
- **`GETTING_STARTED.md`** - This file

---

## Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

Open terminal in your project folder and run:

```bash
npm install
```

This installs:
- `mongoose` (MongoDB ODM)
- `express` (Web framework)
- `csv-parser` (CSV parsing)
- `dotenv` (Environment variables)

### Step 2: Prepare CSV File (5 minutes)

Your Excel file needs to be converted to CSV format:

**Option A: Using Excel**
1. Open `Report-2026-05-30.xlsx`
2. Click File → Save As
3. Choose "CSV (Comma delimited)" format
4. Name it: `hospitals.csv`
5. Save in the root folder (same level as package.json)

**Option B: Using Google Sheets**
1. Upload Excel file to Google Drive
2. Open with Google Sheets
3. File → Download → CSV (.csv)
4. Save as `hospitals.csv` in root folder

**Verify CSV Format:**
Open `hospitals.csv` in a text editor. First line should be:
```
Name,Name (Bangla),Code,Email,Agency,Type,Division,District,City Corporation,Upazila,Paurasava,Union,Private
```

### Step 3: Verify MongoDB Connection (2 minutes)

Check your `.env` file has this line:
```
MONGODB_URI=mongodb+srv://zaforchishti_db_user:69675277@techmed.jhtky9l.mongodb.net/?appName=TechMed
```

✅ Already configured in your project!

**Test connection (optional):**
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✓ Connected'); process.exit(0); }).catch(err => { console.log('✗ Error: ' + err.message); process.exit(1); });"
```

### Step 4: Import Hospital Data (3-5 minutes)

Run the import script:

```bash
npm run import
```

**Expected Output:**
```
🚀 Starting Hospital Data Import...

✓ MongoDB Connected
✓ Processed 500 records | Batch inserted successfully
✓ Processed 1000 records | Batch inserted successfully
✓ Processed 1500 records | Batch inserted successfully
...
[continues until all 39,419 records are imported]

✓ Import completed! Total records processed: 39419

📊 Summary: 39419 hospital records imported successfully
✓ Database connection closed
```

**Notes:**
- Import takes 2-3 minutes for 40k records (this is normal!)
- Records are batched in groups of 500
- Private field (0/1) is automatically converted to Boolean (true/false)
- Each console.log shows progress

### Step 5: Start the Server (1 minute)

```bash
npm start
```

**Expected Output:**
```
✓ Server running on http://localhost:5000
✓ API Docs available at http://localhost:5000/api/docs
```

Server is now running! Keep this terminal open.

### Step 6: Test the API (in new terminal)

**View all hospitals:**
```bash
curl http://localhost:5000/api/hospitals
```

**View statistics:**
```bash
curl http://localhost:5000/api/stats
```

**Search for hospitals in Dhaka:**
```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&page=1&limit=10"
```

---

## What Each File Does

### Application Logic

| File | Purpose |
|------|---------|
| `server.js` | Main Express app with 15+ API endpoints |
| `importHospitals.js` | Streams CSV and imports to MongoDB |
| `models/Hospital.js` | Defines database schema & validation |
| `utils/databaseConnection.js` | Handles MongoDB connection |

### Configuration

| File | Purpose |
|------|---------|
| `package.json` | Lists all dependencies & scripts |
| `.env` | MongoDB credentials (private - don't commit) |
| `.gitignore` | Tells Git which files to ignore |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Full documentation & feature list |
| `API_QUICK_REFERENCE.md` | Common curl examples |
| `GETTING_STARTED.md` | This guide |

---

## API Capabilities

Once the server is running, you can:

### 📊 Read Data
- Get all hospitals (with pagination)
- Get single hospital by ID
- Filter by division, district, type, agency, private status
- Search by name or email
- Get statistics by type and division
- Get distinct values for dropdown lists

### ➕ Create Data
- Add new hospital records

### ✏️ Update Data
- Update hospital information

### 🗑️ Delete Data
- Delete single hospital
- Delete hospitals by filter criteria
- Delete all hospitals (with confirmation)

---

## Common Tasks

### Task: Find all Government hospitals in Dhaka

```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka&type=Government"
```

### Task: Export hospital list to CSV/Excel

```bash
curl "http://localhost:5000/api/hospitals?limit=40000" > hospitals_export.json
```

Then open JSON in Excel.

### Task: Find private hospitals by email domain

```bash
curl "http://localhost:5000/api/hospitals/filter/advanced?email=@gmail.com&private=true"
```

### Task: Get count of hospitals by type

```bash
curl http://localhost:5000/api/stats
```

### Task: Delete all hospitals from a district

```bash
curl -X DELETE "http://localhost:5000/api/hospitals/delete/by-filter?district=Narayanganj"
```

---

## Troubleshooting

### Problem: "ENOENT: no such file or directory, open 'hospitals.csv'"

**Solution:** 
- Ensure `hospitals.csv` is in the root directory (same level as package.json)
- Check filename spelling (case-sensitive on Linux/Mac)

### Problem: "MongoDB Connection Error: connect ECONNREFUSED"

**Solution:**
- Check `.env` file has correct MONGODB_URI
- Verify internet connection
- Check MongoDB Atlas IP whitelist settings
- Ensure IP address is whitelisted in MongoDB Atlas

### Problem: Server won't start on port 5000

**Solution:**
- Port 5000 might be in use
- Kill other processes or change port in `.env`: `PORT=3000`
- Or run: `npm start -- --port 8000`

### Problem: "Duplicate key error" during import

**Solution:**
- Check CSV for duplicate Code values
- Run: `npm run import` again (skips duplicates with ordered: false)

### Problem: Import is very slow

**Solution:**
- Normal for 40k records (takes 2-3 minutes)
- Reduce batch size: Edit `importHospitals.js` line 44, change `BATCH_SIZE = 500` to `250`

---

## Next Steps

### For Development
1. ✅ Install dependencies - `npm install`
2. ✅ Prepare CSV - Convert Excel to CSV
3. ✅ Import data - `npm run import`
4. ✅ Start server - `npm start`
5. ✅ Test API - Use curl or Postman

### For Production
1. Add authentication (JWT tokens)
2. Add rate limiting
3. Add input validation middleware
4. Add request logging
5. Deploy to cloud (Heroku, Render, Railway, etc.)
6. Set up MongoDB backups
7. Configure CORS for frontend

### Frontend Integration
You can now build a React/Vue/Angular frontend that calls these APIs!

Example with fetch:
```javascript
// Get all hospitals
fetch('http://localhost:5000/api/hospitals')
  .then(res => res.json())
  .then(data => console.log(data));

// Filter hospitals
fetch('http://localhost:5000/api/hospitals/filter/advanced?division=Dhaka')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Important Notes

⚠️ **Do NOT commit `.env` file to Git!** (Already in .gitignore)

⚠️ **Before deleting data:**
- Test filters first with `/api/hospitals/filter/advanced?...`
- Backup MongoDB before bulk deletes
- Double-check deletion criteria

✅ **CSV Import best practices:**
- Ensure CSV headers match exactly
- No special characters in Code field
- Private field must be 0 or 1
- Run import only once (subsequent runs may create duplicates)

---

## Getting Help

### View All API Endpoints
```bash
curl http://localhost:5000/api/docs
```

### View MongoDB Data (in Node REPL)
```bash
node
> const Hospital = require('./models/Hospital');
> Hospital.countDocuments().then(count => console.log(count));
> process.exit();
```

### Check MongoDB Connection
```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ Connected')).catch(err => console.log('✗ Error:', err.message));"
```

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Import hospital data from CSV
npm run import

# Start development server
npm start

# Stop server
Ctrl + C

# View API documentation
curl http://localhost:5000/api/docs

# Get all hospitals (first 50)
curl http://localhost:5000/api/hospitals

# Get statistics
curl http://localhost:5000/api/stats
```

---

## You're All Set! 🎉

Your Hospital Manager application is ready. Start with:

```bash
npm run import    # Import data
npm start         # Start server
```

Then open browser to: **http://localhost:5000/api/docs**

Happy coding! 🚀
