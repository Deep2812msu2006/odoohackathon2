import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/appError.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tripRoutes from './routes/trip.routes.js';
import cityRoutes from './routes/city.routes.js';
import activityRoutes from './routes/activity.routes.js';
import publicRoutes from './routes/public.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Uploads Serving
const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server.`, 404, 'ROUTE_NOT_FOUND'));
});

// Centralized Error Middleware
app.use(errorHandler);

export default app;
