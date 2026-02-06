import { connectDatabase } from '../database/mongodb';
import mongoose from 'mongoose';

beforeAll(async () => {
    //can use used to connect to test database
    await connectDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});