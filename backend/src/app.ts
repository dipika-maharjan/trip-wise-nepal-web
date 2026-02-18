import express, {type Application} from 'express';
import {PORT} from './config/index';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import path from 'path/win32';
import {adminUserRoutes} from './routes/admin/user.route';
import accommodationRoutes from './routes/accommodation.route';
import roomTypeRoutes from './routes/roomType.route';
import optionalExtraRoutes from './routes/optionalExtra.route';
import bookingRoutes from './routes/booking.route';
import reviewRoutes from './routes/review.route';

const app: Application = express();

// Configure JSON parser to skip multipart/form-data requests (handled by multer)
app.use(express.json({ 
    type: (req) => {
        const contentType = (req.headers['content-type'] || '') as string;
        // Skip multipart/form-data - let multer handle it
        if (contentType.includes('multipart/form-data')) {
            return false;
        }
        return true;
    }
}));
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
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/optional-extras', optionalExtraRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); //serve static files (images)

export default app;