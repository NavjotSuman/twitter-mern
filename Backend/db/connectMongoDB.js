
import mongoose from "mongoose";


const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error in Connection With MongoDB ${error.message}`);
  }
};

export default connectMongoDB;
