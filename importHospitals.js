require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const importHospitals = async (filePath) => {
  let recordCount = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        recordCount++;

        // Map CSV columns to schema fields
        const hospitalData = {
          name: row.Name || '',
          nameBangla: row['Name (Bangla)'] || '',
          code: parseInt(row.Code) || 0,
          email: row.Email || '',
          agency: row.Agency || '',
          type: row.Type || '',
          division: row.Division || '',
          district: row.District || '',
          cityCorporation: row['City Corporation'] || '',
          upazila: row.Upazila || '',
          paurasava: row.Paurasava || '',
          union: row.Union || '',
          private: row.Private === '1' || row.Private === 1 ? true : false
        };

        batch.push(hospitalData);

        // Insert batch when it reaches BATCH_SIZE
        if (batch.length === BATCH_SIZE) {
          try {
            await Hospital.insertMany(batch, { ordered: false });
            console.log(`✓ Processed ${recordCount} records | Batch inserted successfully`);
            batch = [];
          } catch (error) {
            console.error(`✗ Batch insertion error at record ${recordCount}:`, error.message);
          }
        }
      })
      .on('end', async () => {
        // Insert remaining records
        if (batch.length > 0) {
          try {
            await Hospital.insertMany(batch, { ordered: false });
            console.log(`✓ Processed ${recordCount} records | Final batch inserted`);
          } catch (error) {
            console.error(`✗ Final batch insertion error:`, error.message);
          }
        }

        console.log(`\n✓ Import completed! Total records processed: ${recordCount}`);
        resolve(recordCount);
      })
      .on('error', (error) => {
        console.error(`✗ Stream error: ${error.message}`);
        reject(error);
      });
  });
};

const main = async () => {
  console.log('🚀 Starting Hospital Data Import...\n');
  
  // Check if CSV file exists
  const csvFile = './hospitals.csv';
  if (!fs.existsSync(csvFile)) {
    console.error(`✗ CSV file not found: ${csvFile}`);
    console.log('Please ensure hospitals.csv exists in the root directory');
    process.exit(1);
  }

  await connectDB();

  try {
    const totalRecords = await importHospitals(csvFile);
    console.log(`\n📊 Summary: ${totalRecords} hospital records imported successfully`);
  } catch (error) {
    console.error(`✗ Import failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
};

main();
