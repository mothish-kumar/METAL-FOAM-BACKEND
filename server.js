import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import adminRouter from './routes/adminRoutes.js';
import employeeRouter from './routes/employeeRoute.js';
import connectDB from './config/db.js';
import authRouter from './routes/authRoute.js';
import resourceAnalystRouter from './routes/resourceAnalystRoute.js';
import cookieParser from 'cookie-parser';
import designSupportRouter from './routes/designSupportRoutes.js';
import productionRouter from './routes/productionRoute.js';
import qualityRouter from './routes/qualityRoute.js'
import dashboardRouter from './routes/dashboardRouter.js'

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')));

// Connect to MongoDB
connectDB();

app.use('/api/admin', adminRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/auth', authRouter);
app.use('/api/resource-analyst', resourceAnalystRouter);
app.use('/api/design-support', designSupportRouter);
app.use('/api/production', productionRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/dashboard',dashboardRouter)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
