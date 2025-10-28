import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Middleware CORS + JSON
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/booking", bookingRoutes);

// ✅ Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend démarré sur http://localhost:${PORT}`);
});
