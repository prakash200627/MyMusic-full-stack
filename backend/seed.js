import mongoose from "mongoose";
import 'dotenv/config';
import albumModel from "./src/models/albumModel.js";
import songModel from "./src/models/songModel.js";

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB for seeding...");
        await mongoose.connect(`${process.env.MONGODB_URL}/spotify`);
        console.log("Connected successfully!");

        // Clear existing data to avoid duplicates
        await albumModel.deleteMany({});
        await songModel.deleteMany({});
        console.log("Cleared existing albums and songs.");

        // Create default albums
        const albums = [
            {
                title: "Top Global Hits",
                desc: "Your weekly update of the most played tracks worldwide.",
                bgColor: "#2a4365",
                image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"
            },
            {
                title: "Chill Vibes",
                desc: "Smooth beats to help you relax, study, or focus.",
                bgColor: "#2d3748",
                image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
            }
        ];

        await albumModel.insertMany(albums);
        console.log("Inserted mock albums!");

        // Create default songs with reliable public domain audio URLs
        const songs = [
            {
                title: "Summer Breeze",
                desc: "An upbeat acoustic track perfect for sunny days.",
                album: "Top Global Hits",
                image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500",
                file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                duration: "6:12"
            },
            {
                title: "Night Sky",
                desc: "A soothing synthwave melody for late-night drives.",
                album: "Chill Vibes",
                image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500",
                file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                duration: "7:05"
            },
            {
                title: "Electric Pulse",
                desc: "High energy electronic beats to power your morning.",
                album: "Top Global Hits",
                image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
                file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                duration: "5:44"
            }
        ];

        await songModel.insertMany(songs);
        console.log("Inserted mock songs!");

        console.log("\n✅ Database seeding complete! You can now view your music on the player.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
