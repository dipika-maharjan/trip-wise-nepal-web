import mongoose from "mongoose";
import { MONGODB_URI } from "../config/index";

export async function connectDatabase(){
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}