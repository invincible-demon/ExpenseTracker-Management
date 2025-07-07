import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const db = process.env.MONGO_URL;
        
        if (!db) {
            throw new Error('MONGO_URL environment variable is not defined');
        }

        const { connection } = await mongoose.connect(db, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`✅ MongoDB Connected to ${connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}