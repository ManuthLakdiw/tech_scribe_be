import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rootRouter from './routes/root';
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: [
        "https://tech-scribe-fe.vercel.app", // ඔයාගේ Frontend URL එක (Production)
        "http://localhost:5173"              // Localhost (Testing සඳහා)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));


app.use("/api/v1", rootRouter)


mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error);
    });




