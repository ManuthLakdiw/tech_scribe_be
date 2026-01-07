import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rootRouter from './routes/root';
import cors from "cors";

dotenv.config();

const app: Express = express();

// 1. CORS Setup (Credentials සහ Headers අනිවාර්යයි)
app.use(cors({
    origin: [
        "https://tech-scribe-fe.vercel.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // headers allow කරන්න
    credentials: true // Cookies/Tokens සඳහා
}));

app.use(express.json());

// 2. Database Connection Handling for Serverless
// Vercel එකේ function එක execute වෙන හැම පාරම DB connect වෙන එක වලක්වන්න cached connection පාවිච්චි කරනවා.
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        isConnected = true;
        console.log('✅ New MongoDB Connection Established');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        throw error; // Error එක එලියට දාන්න, එතකොට 500 error එකක් විදිහට backend එකෙන් අල්ලගන්න පුලුවන්
    }
};

// 3. Database Connection Middleware
// හැම request එකක්ම process කරන්න කලින් DB එක connect වෙලාද බලනවා
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (error: any) {
        console.error('❌ DB Error:', error); // Server Log එකේ බලන්න

        // 👇 Postman එකට ඇත්ත Error එක යවන්න (Debug කරන්න ලේසියි)
        res.status(500).json({
            message: "Database Connection Failed",
            error: error.message
        });
    }
});

// 4. Routes
app.use("/api/v1", rootRouter);

// Health Check Route
app.get("/", (req: Request, res: Response) => {
    res.send("TechScribe API is Running...");
});

// 5. Local Server Start (For Development only)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    mongoose.connect(process.env.MONGO_URI as string)
        .then(() => {
            app.listen(PORT, () => console.log(`🚀 Server running locally on port ${PORT}`));
        })
        .catch(err => console.log(err));
}

// 6. Export App (For Vercel)
export default app;