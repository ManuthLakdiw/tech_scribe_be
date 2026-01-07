import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rootRouter from './routes/root';
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());

app.use(
    cors()
)

app.use("/api/v1", rootRouter)

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error)
    })

app.listen(process.env.PORT, () => {
    console.log("Server is running")
})

