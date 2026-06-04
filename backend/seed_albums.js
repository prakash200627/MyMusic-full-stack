import mongoose from "mongoose";
import 'dotenv/config';
import songModel from "./src/models/songModel.js";
import albumModel from "./src/models/albumModel.js";
import Artist from "./src/models/Artist.js";

const seedAlbums = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(`${process.env.MONGODB_URL}/mymusic`);
        console.log("Connected successfully!");

        // 1. Fetch all songs
        const songs = await songModel.find({});
        console.log(`Fetched ${songs.length} songs from database.`);

        // 2. Ensure default artist exists
        let platformArtist = await Artist.findOne({});
        if (!platformArtist) {
            platformArtist = new Artist({
                name: "MyMusic Artist",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
                bio: "Default platform artist biography"
            });
            await platformArtist.save();
            console.log("Created default Artist.");
        }

        // 3. Clear existing albums to avoid duplication
        await albumModel.deleteMany({});
        console.log("Cleared old albums.");

        // 4. Group songs by album name
        const albumGroups = {};
        for (const s of songs) {
            const albumName = s.album || "Unknown Album";
            if (!albumGroups[albumName]) {
                albumGroups[albumName] = [];
            }
            albumGroups[albumName].push(s);
        }

        const uniqueAlbumNames = Object.keys(albumGroups);
        console.log(`Found ${uniqueAlbumNames.length} unique albums to seed.`);

        // 5. Create album documents
        const seededAlbums = [];
        for (const albName of uniqueAlbumNames) {
            const groupSongs = albumGroups[albName];
            const firstSong = groupSongs[0];

            // Use curated beautiful bgColors or a pleasant default dark color
            const colors = ["#2a4365", "#22543d", "#742a2a", "#3c366b", "#4a5568", "#1a202c"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const newAlbum = new albumModel({
                title: albName,
                desc: `A premium MyMusic playlist featuring hits from the album ${albName}.`,
                image: firstSong.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
                bgColor: randomColor,
                artistId: platformArtist._id,
                songs: groupSongs.map(s => s._id)
            });

            await newAlbum.save();
            seededAlbums.push(newAlbum);

            // Also, update the songs' albumId field with this album's ObjectId to ensure perfect relational coherence!
            await songModel.updateMany(
                { _id: { $in: groupSongs.map(s => s._id) } },
                { $set: { albumId: newAlbum._id } }
            );
        }

        console.log(`✨ Successfully seeded ${seededAlbums.length} unique albums in the "albums" collection and linked all song ObjectIds!`);
        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error("Seeding albums failed:", err);
        process.exit(1);
    }
};

seedAlbums();
