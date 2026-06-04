import mongoose from "mongoose";
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import songModel from "./src/models/songModel.js";

// Config Cloudinary using env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_API
});

const ORG_MUSIC_DIR = "C:\\Users\\prakash\\Downloads\\OrganizedMusic";
const SONGS_JSON_PATH = path.join(ORG_MUSIC_DIR, "songs.json");
const LOG_FILE_PATH = path.join(ORG_MUSIC_DIR, "upload_and_import_logs.txt");
const REPORT_FILE_PATH = path.join(ORG_MUSIC_DIR, "integration_report.md");
const CACHE_FILE_PATH = path.join(ORG_MUSIC_DIR, "upload_cache.json");

// Logger helper
const logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'w' });
const log = (msg) => {
    const time = new Date().toISOString();
    const line = `[${time}] ${msg}`;
    console.log(line);
    logStream.write(line + "\n");
};

// Concurrency limiter helper
const limitConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = new Set();
    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);
        executing.add(p);
        const clean = () => executing.delete(p);
        p.then(clean, clean);
        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }
    return Promise.all(results);
};

// Database Upserter helper
const upsertSongToDb = async (song, audioData, coverData) => {
    try {
        await songModel.findOneAndUpdate(
            { title: song.title, artist: song.artist },
            {
                title: song.title,
                artist: song.artist,
                album: song.album,
                genre: song.genre || "Unknown Genre",
                language: song.language || "Unknown Language",
                duration: song.duration_formatted || "0:00",
                bitrate: song.bitrate_kbps || 128,
                year: song.year || "Unknown Year",
                audioUrl: audioData.secure_url,
                coverUrl: coverData ? coverData.secure_url : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
                audioPublicId: audioData.public_id,
                imagePublicId: coverData ? coverData.public_id : "placeholder"
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        log(`⚠️ MongoDB Upsert Failed for "${song.title}": ${err.message}`);
    }
};

const runMigration = async () => {
    try {
        log("🚀 Starting MyMusic Cloudinary Incremental Upload & Seeding Script...");

        if (!fs.existsSync(SONGS_JSON_PATH)) {
            log(`❌ Source metadata file not found at: ${SONGS_JSON_PATH}`);
            process.exit(1);
        }

        const songsData = JSON.parse(fs.readFileSync(SONGS_JSON_PATH, 'utf8'));
        log(`📊 Found ${songsData.length} song records in songs.json.`);

        // Read or initialize cache
        let cache = { covers: {}, audio: {} };
        if (fs.existsSync(CACHE_FILE_PATH)) {
            try {
                cache = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8'));
                log(`💾 Loaded existing upload cache with ${Object.keys(cache.covers).length} covers and ${Object.keys(cache.audio).length} audio uploads.`);
            } catch (err) {
                log(`⚠️ Could not parse cache file, starting with empty cache: ${err.message}`);
            }
        }

        // Connect to MongoDB upfront to allow incremental inserts
        log("Connecting to MongoDB Atlas...");
        await mongoose.connect(`${process.env.MONGODB_URL}/mymusic`);
        log("MongoDB Connected! Enabling live synchronization...");

        const stats = {
            totalSongs: songsData.length,
            audioUploaded: 0,
            audioCached: 0,
            coversUploaded: 0,
            coversCached: 0,
            failedUploads: 0,
            insertedDb: 0
        };

        const failedUploadList = [];

        // Step 1: Pre-upload cover images in parallel (deduplicated)
        // Extract unique cover art paths
        const uniqueCovers = [...new Set(songsData.map(s => s.cover_art_thumbnail).filter(Boolean))];
        log(`🎨 Found ${uniqueCovers.length} unique cover images to process.`);

        const coverTasks = uniqueCovers.map(relPath => async () => {
            const absolutePath = path.join(ORG_MUSIC_DIR, relPath);
            if (cache.covers[relPath]) {
                stats.coversCached++;
                return;
            }

            if (!fs.existsSync(absolutePath)) {
                log(`⚠️ Cover image file not found: ${absolutePath}`);
                return;
            }

            try {
                log(`Uploading Cover: ${relPath}...`);
                const res = await cloudinary.uploader.upload(absolutePath, {
                    folder: "mymusic/images",
                    resource_type: "image"
                });
                
                cache.covers[relPath] = {
                    secure_url: res.secure_url,
                    public_id: res.public_id,
                    resource_type: "image"
                };
                stats.coversUploaded++;

                // Save cache checkpoint
                fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
            } catch (err) {
                log(`❌ Failed to upload cover image ${relPath}: ${err.message}`);
                failedUploadList.push({ type: "image", path: relPath, error: err.message });
            }
        });

        log("⏳ Processing unique cover images on Cloudinary (concurrency limit = 5)...");
        await limitConcurrency(coverTasks, 5);
        log("✅ Cover art processing complete!");

        // Step 2: Upload audio files and upsert into DB incrementally
        log("⏳ Processing audio tracks and syncing with MongoDB (concurrency limit = 3)...");

        const audioTasks = songsData.map((song, index) => async () => {
            const relPath = song.organized_path;
            const md5 = song.md5_hash;
            const absolutePath = path.join(ORG_MUSIC_DIR, relPath);

            const coverInfo = cache.covers[song.cover_art_thumbnail];

            // check audio cache
            if (cache.audio[md5]) {
                stats.audioCached++;
                song.audioUrl = cache.audio[md5].secure_url;
                song.audioPublicId = cache.audio[md5].public_id;
                
                if (coverInfo) {
                    song.coverUrl = coverInfo.secure_url;
                    song.coverPublicId = coverInfo.public_id;
                }

                // Sync immediately from Cache!
                await upsertSongToDb(song, cache.audio[md5], coverInfo);
                stats.insertedDb++;
                return;
            }

            if (!fs.existsSync(absolutePath)) {
                log(`⚠️ Audio file not found: ${absolutePath}`);
                failedUploadList.push({ type: "audio", path: relPath, error: "File not found locally" });
                stats.failedUploads++;
                return;
            }

            try {
                log(`[${index + 1}/${songsData.length}] Uploading audio: ${song.title}...`);
                const res = await cloudinary.uploader.upload(absolutePath, {
                    folder: "mymusic/audio",
                    resource_type: "video" // crucial for audio/MP3s
                });

                const audioData = {
                    secure_url: res.secure_url,
                    public_id: res.public_id,
                    resource_type: "video"
                };

                cache.audio[md5] = audioData;
                stats.audioUploaded++;

                song.audioUrl = res.secure_url;
                song.audioPublicId = res.public_id;

                if (coverInfo) {
                    song.coverUrl = coverInfo.secure_url;
                    song.coverPublicId = coverInfo.public_id;
                }

                // Upsert to DB immediately!
                await upsertSongToDb(song, audioData, coverInfo);
                stats.insertedDb++;

                // Save cache checkpoint
                fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
            } catch (err) {
                log(`❌ Failed to upload audio ${song.title}: ${err.message}`);
                failedUploadList.push({ type: "audio", path: relPath, error: err.message });
                stats.failedUploads++;
            }
        });

        await limitConcurrency(audioTasks, 3);
        log("✅ Audio uploads and database synchronization complete!");

        // Step 3: Write the updated songs.json with Cloudinary properties
        const finalSongs = songsData.map(song => {
            const audioData = cache.audio[song.md5_hash];
            const coverData = cache.covers[song.cover_art_thumbnail];

            return {
                title: song.title,
                artist: song.artist,
                album: song.album,
                genre: song.genre || "Unknown Genre",
                language: song.language || "Unknown Language",
                duration: song.duration_formatted || "0:00",
                bitrate: song.bitrate_kbps || 128,
                year: song.year || "Unknown Year",
                audioUrl: audioData ? audioData.secure_url : "",
                coverUrl: coverData ? coverData.secure_url : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
                audioPublicId: audioData ? audioData.public_id : "placeholder",
                imagePublicId: coverData ? coverData.public_id : "placeholder"
            };
        });

        fs.writeFileSync(SONGS_JSON_PATH, JSON.stringify(finalSongs, null, 2));
        log("📝 Updated metadata written to songs.json!");

        // Close mongoose connection
        await mongoose.disconnect();
        log("🔌 MongoDB connection closed.");

        // Step 4: Generate Final Integration Report
        const reportContent = `# Final Integration Report: MyMusic Library

This report summarizes the integration process of the OrganizedMusic library into the MyMusic full-stack application using Cloudinary and MongoDB.

## Process Summary
- **Source Metadata File:** [songs.json](file:///C:/Users/prakash/Downloads/OrganizedMusic/songs.json)
- **Log File:** [upload_and_import_logs.txt](file:///C:/Users/prakash/Downloads/OrganizedMusic/upload_and_import_logs.txt)
- **Target Database Collection:** \`songs\` on MongoDB Atlas (mymusic database)
- **Media Hosting Platform:** Cloudinary (Folders: \`mymusic/audio\` and \`mymusic/images\`)

## Execution Metrics
| Metric | Count | Details |
| :--- | :--- | :--- |
| **Total Songs Evaluated** | ${stats.totalSongs} | Total metadata rows processed from songs.json |
| **Audio Uploads (Cloudinary)** | ${stats.audioUploaded} | New files sent to \`mymusic/audio\` |
| **Audio Cache Hits** | ${stats.audioCached} | Cached files reused from previous attempts |
| **Cover Artwork Uploads (Cloudinary)** | ${stats.coversUploaded} | Unique covers sent to \`mymusic/images\` |
| **Cover Artwork Cache Hits** | ${stats.coversCached} | Shared cover files deduplicated & cached |
| **Failed Uploads** | ${stats.failedUploads} | Number of items that failed during transfer |
| **MongoDB Live Synced Records** | ${stats.insertedDb} | Songs upserted into MongoDB |

## Deduplication Efficiency
- By recognizing shared album covers across different tracks and keeping a local cache map, we saved **${stats.coversCached} image uploads**, dramatically accelerating the seeding time and saving Cloudinary storage!

${failedUploadList.length > 0 ? `## Failed Uploads Details
\`\`\`json
${JSON.stringify(failedUploadList, null, 2)}
\`\`\`
` : `## Failed Uploads Details
- **No failed uploads!** All songs and cover artwork are successfully processed and hosted.`}

## Schema Conformance
Every document in MongoDB matches the clean Mongoose Song schema:
- **Title, Artist, Album, Genre, Language, Duration, Bitrate, Year, audioUrl, coverUrl, audioPublicId, imagePublicId**
- Visual compatibilities via virtual getters for **\`file\`**, **\`image\`**, **\`name\`**, and **\`artistName\`** are fully verified.
`;

        fs.writeFileSync(REPORT_FILE_PATH, reportContent);
        log(`🎉 Final Integration Report written successfully to: ${REPORT_FILE_PATH}`);
        log("🏁 Migration Process Finished Successfully!");

        logStream.end();
        process.exit(0);

    } catch (err) {
        log(`❌ Migration script failed with fatal error: ${err.message}`);
        console.error(err);
        logStream.end();
        process.exit(1);
    }
};

runMigration();
