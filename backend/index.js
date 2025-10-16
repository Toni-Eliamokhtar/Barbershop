import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend démarré sur http://localhost:${PORT}`)
);
