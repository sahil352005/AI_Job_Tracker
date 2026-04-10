import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();

// ✅ Allowed origins (dev + prod)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Health check route (important for Railway)
app.get("/", (req, res) => {
  res.send("🚀 API is running");
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

// ✅ Port
const PORT = process.env.PORT || 5000;

// ✅ Start server only after DB connects
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });