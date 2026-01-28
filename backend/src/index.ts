import express, {type Application} from 'express';
import {PORT} from './config/index';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import path from 'path/win32';
import {adminUserRoutes} from './routes/admin/user.route';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3003"],
}

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); //serve static files (images)


async function startServer(){
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}
startServer();