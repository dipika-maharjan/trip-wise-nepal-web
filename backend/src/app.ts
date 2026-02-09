import express, {type Application} from 'express';
import {PORT} from './config/index';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import path from 'path/win32';
import {adminUserRoutes} from './routes/admin/user.route';
import accommodationRoutes from './routes/accommodation.route';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3003"],
}

app.use(cors(corsOptions));

app.get('/open-app', (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) return res.status(400).send('Missing token');
  res.redirect(`tripwisenepal://reset-password?token=${token}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); //serve static files (images)

export default app;