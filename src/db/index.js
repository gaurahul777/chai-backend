import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const { MONGODB_URI, PORT } = process.env;

const connectDB = async () => {
  try {
   const connectionInstance= await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
   console.log(connectionInstance);
   console.log(`\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("MONGO DB ERROR :", error);
    //thorw bhi kerwa skate ho
    process.exit(1);
  }
};

export default connectDB;