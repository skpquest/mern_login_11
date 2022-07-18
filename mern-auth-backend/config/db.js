const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://swatikaithwas:swatikaithwas123@cluster0.e6eyd.mongodb.net/?retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`MongoDB connected ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
