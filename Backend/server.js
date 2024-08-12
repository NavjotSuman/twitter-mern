import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// impoting from our files
import authRoutes from "./Routes/auth.route.js";
import userRoutes from "./Routes/user.route.js";
import postRoutes from "./Routes/post.route.js";
import connectMongoDB from "./db/connectMongoDB.js";

// for enable to use .env files
configDotenv();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});
const app = express();
const PORT = process.env.PORT || 4000


// middlewares
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);








app.listen(PORT, () => {
    console.log(`Running at ${PORT}`);
    connectMongoDB();
});
