import mongoose from "mongoose";
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import albumModel from "./src/models/albumModel.js";
import songModel from "./src/models/songModel.js";
import path from 'path';

// Config Cloudinary using your .env credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_API
});

// Resolve the path to the frontend assets folder containing MP3s and JPGs
const assetsDir = path.resolve('../frontend/src/assets');

const seedLocalDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(`${process.env.MONGODB_URL}/spotify`);
        console.log("Connected successfully!");

        // Clear existing data to avoid overlap
        await albumModel.deleteMany({});
        await songModel.deleteMany({});
        console.log("Cleared old albums and songs.");

        // Define albums matching your frontend/src/assets/assets.js catalog
        const albumData = [
            { title: "Top 50 Global", desc: "Your weekly update of the most played tracks", bgColor: "#2a4365", imageFile: "img8.jpg" },
            { title: "Top 50 India", desc: "Your weekly update of the most played tracks", bgColor: "#22543d", imageFile: "img9.jpg" },
            { title: "Trending India", desc: "Your weekly update of the most played tracks", bgColor: "#742a2a", imageFile: "img10.jpg" }
        ];

        console.log("\n🚀 Uploading Album covers to Cloudinary...");
        const albums = [];
        for (const alb of albumData) {
            const imgPath = path.join(assetsDir, alb.imageFile);
            console.log(`Uploading album artwork: ${alb.imageFile}...`);
            const uploadRes = await cloudinary.uploader.upload(imgPath, { resource_type: "image" });
            
            albums.push({
                title: alb.title,
                desc: alb.desc,
                bgColor: alb.bgColor,
                image: uploadRes.secure_url
            });
        }

        await albumModel.insertMany(albums);
        console.log("✅ Inserted albums successfully!");

        // Define songs matching your frontend/src/assets/assets.js catalog
        const songData = [
            { title: "Song One", desc: "Put a smile on your face with these happy tunes", album: "Top 50 Global", audioFile: "song1.mp3", imageFile: "img1.jpg", duration: "3:00" },
            { title: "Song Two", desc: "Put a smile on your face with these happy tunes", album: "Top 50 Global", audioFile: "song2.mp3", imageFile: "img2.jpg", duration: "2:20" },
            { title: "Song Three", desc: "Put a smile on your face with these happy tunes", album: "Top 50 India", audioFile: "song3.mp3", imageFile: "img3.jpg", duration: "2:32" },
            { title: "Song Four", desc: "Put a smile on your face with these happy tunes", album: "Top 50 India", audioFile: "song1.mp3", imageFile: "img4.jpg", duration: "2:50" },
            { title: "Song Five", desc: "Put a smile on your face with these happy tunes", album: "Trending India", audioFile: "song2.mp3", imageFile: "img5.jpg", duration: "3:10" }
        ];

        console.log("\n🚀 Uploading Local Songs (MP3s and Covers) to Cloudinary... (This will take a moment)");
        for (const s of songData) {
            const audioPath = path.join(assetsDir, s.audioFile);
            const imagePath = path.join(assetsDir, s.imageFile);

            console.log(`Uploading media for: "${s.title}" (${s.audioFile} & ${s.imageFile})...`);
            
            // Upload audio and image in parallel
            const [audioUpload, imageUpload] = await Promise.all([
                cloudinary.uploader.upload(audioPath, { resource_type: "video" }),
                cloudinary.uploader.upload(imagePath, { resource_type: "image" })
            ]);

            await songModel.create({
                title: s.title,
                desc: s.desc,
                album: s.album,
                image: imageUpload.secure_url,
                file: audioUpload.secure_url,
                duration: s.duration
            });
            console.log(`Successfully added: "${s.title}"`);
        }

        console.log("\n🎉 Showcase Seeding Successful! All local MP3s & images are now live on your MongoDB & Cloudinary database!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Local Seeding failed:", error);
        process.exit(1);
    }
};

seedLocalDatabase();
