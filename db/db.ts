import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config()
export default async function connectToDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URI||"")
        console.log("connect to DB");
    } catch (error) {
        console.log(error);
    }
}