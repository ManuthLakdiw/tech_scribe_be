import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rootRouter from './routes/root';
import cors from "cors";

dotenv.config();

const app = express();

// 1. CORS Middleware (මේක මුලින්ම තියෙන්න ඕන)
app.use(cors({
    origin: [
        "https://tech-scribe-fe.vercel.app", // Production Frontend
        "http://localhost:5173"              // Local Development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 2. Serverless Database Connection Logic
// Vercel එකේදි හැම request එකකදීම DB connect නොවී, තියෙන connection එක පාවිච්චි කරන්න.
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing MongoDB connection");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI as string);
        isConnected = !!db.connections[0].readyState;
        console.log("✅ New MongoDB Connection Established");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
    }
};

// 3. Database Connection Middleware
// Route එකට යන්න කලින් DB එක Connect වෙලාද බලනවා
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (error: any) {
        console.error("❌ Database Connection Error:", error); // Console එකෙත් බලන්න

        // 👇 ඇත්ත Error එක Client ට යවන්න (Debug කරන්න ලේසියි)
        res.status(500).json({
            message: "Database connection failed",
            error: error.message // <--- මේක එකතු කරන්න
        });
    }
});

// 4. Routes
app.use("/api/v1", rootRouter);

// Health Check Route (Testing only)
app.get("/", (req, res) => {
    res.send("TechScribe API is running!");
});

// 5. Local Server Start (Vercel එකේදි මේ කොටස run වෙන්නේ නෑ, Local විතරයි)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    mongoose.connect(process.env.MONGO_URI as string).then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Local Server running on port ${PORT}`);
        });
    });
}

// 6. Export App (Vercel සඳහා අත්‍යවශ්‍යයි)
export default app;