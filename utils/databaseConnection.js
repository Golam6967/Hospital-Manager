const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.MONGODB_URI);

  try {
    console.log(process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log("Hocche na");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
