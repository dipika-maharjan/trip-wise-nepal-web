import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT):5050;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/trip_wise_nepal_backend';
export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default_secret';