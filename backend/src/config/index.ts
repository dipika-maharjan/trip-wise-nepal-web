import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT):5050;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/trip_wise_nepal_backend';
export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default_secret';

export const TAX_PERCENT: number =
    process.env.TAX_PERCENT ? parseFloat(process.env.TAX_PERCENT) : 13;
export const SERVICE_FEE: number =
    process.env.SERVICE_FEE ? parseFloat(process.env.SERVICE_FEE) : 0;