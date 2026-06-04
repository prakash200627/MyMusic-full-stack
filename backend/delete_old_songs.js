import mongoose from "mongoose";
import 'dotenv/config';
import songModel from "./src/models/songModel.js";

const cleanup = async () => {
    try {
        console.log("Connecting to MongoDB Atlas for cleanup...");
        await mongoose.connect(`${process.env.MONGODB_URL}/mymusic`);
        console.log("Connected! Scanning for old mock songs...");

        // Delete any song document that does not contain 'audioPublicId'
        const res = await songModel.deleteMany({
            $or: [
                { audioPublicId: { $exists: false } },
                { audioPublicId: null },
                { audioPublicId: "placeholder" }
            ]
        });

        console.log(`🧹 Cleaned up: Deleted ${res.deletedCount} old mock songs successfully.`);
        await mongoose.disconnect();
        console.log("Cleanup finished!");
        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
};

cleanup();
