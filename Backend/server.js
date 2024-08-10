import express from "express";
import { configDotenv } from "dotenv";



// impoting from our files
import authRoutes from "./Routes/auth.route.js";
import connectMongoDB from "./db/connectMongoDB.js";



// for enable to use .env files
configDotenv();
const app = express();


// middlewares
app.use("/api/auth", authRoutes);


// variables
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Running at ${PORT}`);
    connectMongoDB();
});
