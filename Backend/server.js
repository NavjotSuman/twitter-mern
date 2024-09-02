import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import path from "path";

// impoting from our files
import authRoutes from "./Routes/auth.route.js";
import userRoutes from "./Routes/user.route.js";
import postRoutes from "./Routes/post.route.js";
import notificationRoutes from "./Routes/notification.route.js";
import connectMongoDB from "./db/connectMongoDB.js";

// for enable to use .env files
configDotenv();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

// middlewares
app.use(express.json({ limit: "3MB" }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(express.static(path.join(__dirname, "/Frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Running at ${PORT}`);
  connectMongoDB();
});
