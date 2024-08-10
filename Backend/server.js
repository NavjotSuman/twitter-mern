import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";



// impoting from our files
import authRoutes from "./Routes/auth.route.js";
import connectMongoDB from "./db/connectMongoDB.js";


// for enable to use .env files
configDotenv();
const app = express();
const PORT = process.env.PORT || 4000


// middlewares
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes);








app.listen(PORT, () => {
    console.log(`Running at ${PORT}`);
    connectMongoDB();
});
