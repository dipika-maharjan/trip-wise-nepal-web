import express, {type Application} from 'express';
import {PORT} from './config/index';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);


async function startServer(){
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}
startServer();