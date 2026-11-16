import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = [
  env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.FRONTEND_ORIGIN === "*") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
