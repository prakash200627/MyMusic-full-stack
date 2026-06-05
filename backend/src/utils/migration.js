import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import Artist from "../models/Artist.js";
import User from "../models/User.js";
import Playlist from "../models/Playlist.js";
import bcrypt from "bcryptjs";
import fs from "fs";

export const runStartupMigration = async () => {
    try {
        console.log("🚀 Starting database relational migration scan for MyMusic schema...");

        const songs = await songModel.find({});
        const albums = await albumModel.find({});
        const artists = await Artist.find({});

        console.log(`🔍 Found ${songs.length} songs, ${albums.length} albums, and ${artists.length} artists.`);

        // Ensure we have at least one fallback artist
        let fallbackArtist = await Artist.findOne({});
        if (!fallbackArtist) {
            fallbackArtist = new Artist({
                name: "MyMusic Artist",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
                bio: "Default MyMusic Artist biography profile"
            });
            await fallbackArtist.save();
            console.log(`🆕 Created fallback Artist Profile: "${fallbackArtist.name}"`);
        }

        // Clean up and seed users from admin/users.json
        console.log("👥 Restructuring and seeding users from admin/users.json...");

        const usersJsonPath = process.env.USERS_JSON_PATH || "./users.json";

        if (fs.existsSync(usersJsonPath)) {
            const usersData = JSON.parse(fs.readFileSync(usersJsonPath, "utf-8"));
            for (const u of usersData) {
                const targetUsername = u.username || u.name;
                const existingUser = await User.findOne({ username: targetUsername });
                if (existingUser) {
                    console.log(`👤 User profile already exists: "${targetUsername}". Keeping existing profile (ID: ${existingUser._id})`);
                } else {
                    const hashedPassword = await bcrypt.hash(u.password, 10);
                    const newUser = new User({
                        username: targetUsername,
                        email: u.email || `${targetUsername.toLowerCase()}@mymusic.local`,
                        password: hashedPassword,
                        role: u.role || "user",
                        status: "active"
                    });
                    await newUser.save();
                    console.log(`👤 Seeded User profile: "${newUser.username}" (${newUser.role})`);
                }
            }
        } else {
            const existingAdmin = await User.findOne({ username: "admin" });
            if (!existingAdmin) {
                console.warn("⚠️ users.json was not found. Seeding a fallback admin profile.");
                const hashedPassword = await bcrypt.hash("admin", 10);
                const fallbackAdmin = new User({
                    username: "admin",
                    email: "admin@mymusic.local",
                    password: hashedPassword,
                    role: "admin",
                    status: "active"
                });
                await fallbackAdmin.save();
            }
        }

        // Scan and reassign orphaned playlists
        const activeUsers = await User.find({});
        const userMap = {};
        activeUsers.forEach(user => {
            userMap[user._id.toString()] = user;
        });

        const bhanuUser = activeUsers.find(u => u.username.toLowerCase() === "bhanu");
        const fallbackUser = bhanuUser || activeUsers[0];

        if (fallbackUser) {
            const playlists = await Playlist.find({});
            let reassignedPlaylists = 0;
            for (const playlist of playlists) {
                if (!playlist.creator || !userMap[playlist.creator.toString()]) {
                    playlist.creator = fallbackUser._id;
                    await playlist.save();
                    reassignedPlaylists++;
                }
            }
            if (reassignedPlaylists > 0) {
                console.log(`🩹 Re-assigned ${reassignedPlaylists} orphaned playlists to user "${fallbackUser.username}" (ID: ${fallbackUser._id})`);
            }
        }

        // Create lookups
        const albumById = {};
        const albumByTitle = {};
        for (const album of albums) {
            albumById[album._id.toString()] = album;
            albumByTitle[album.title.toLowerCase()] = album;
        }

        let migratedSongs = 0;
        let syncedAlbumSongs = 0;

        for (const song of songs) {
            let needsSave = false;

            // A. Migrate artistId
            if (!song.artistId) {
                const legacyArtistVal = song.artist || song.artistId;
                if (legacyArtistVal && /^[0-9a-fA-F]{24}$/.test(String(legacyArtistVal))) {
                    song.artistId = legacyArtistVal;
                } else {
                    song.artistId = fallbackArtist._id;
                }
                needsSave = true;
            }

            // B. Migrate albumId
            const legacyAlbumVal = song.album || song.albumId;
            if (legacyAlbumVal && !song.albumId) {
                const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(legacyAlbumVal));

                if (isObjectId) {
                    const albumExists = albumById[String(legacyAlbumVal)];
                    if (albumExists) {
                        song.albumId = legacyAlbumVal;
                    } else {
                        song.albumId = undefined;
                    }
                } else {
                    // Legacy string album title
                    const albumTitleStr = String(legacyAlbumVal).trim();
                    let matchedAlbum = albumByTitle[albumTitleStr.toLowerCase()];

                    if (!matchedAlbum) {
                        console.log(`🆕 Creating Matched Album "${albumTitleStr}" for song "${song.title}"`);
                        matchedAlbum = new albumModel({
                            title: albumTitleStr,
                            desc: `Official release for ${albumTitleStr}`,
                            image: song.image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
                            bgColor: "#121212",
                            artistId: song.artistId,
                            songs: []
                        });
                        await matchedAlbum.save();
                        albumById[matchedAlbum._id.toString()] = matchedAlbum;
                        albumByTitle[albumTitleStr.toLowerCase()] = matchedAlbum;
                    }
                    song.albumId = matchedAlbum._id;
                }
                needsSave = true;
                migratedSongs++;
            }

            if (needsSave) {
                await song.save();
            }

            // C. Sync Album's songs array
            if (song.albumId) {
                const targetAlbum = albumById[String(song.albumId)];
                if (targetAlbum) {
                    if (!targetAlbum.songs) {
                        targetAlbum.songs = [];
                    }
                    const hasSong = targetAlbum.songs.some(id => String(id) === String(song._id));
                    if (!hasSong) {
                        targetAlbum.songs.push(song._id);
                        await targetAlbum.save();
                        syncedAlbumSongs++;
                        console.log(`➕ Synced track "${song.title}" reference into Album "${targetAlbum.title}"`);
                    }
                }
            }
        }

        // D. REPAIR CORRUPTION: Remove auto-assigned songs from albums (like "Jersey") caused by legacy fallback migration
        const jerseyAlbum = await albumModel.findOne({ title: { $regex: /^jersey$/i } });
        if (jerseyAlbum) {
            // 1. Reset songs that were incorrectly assigned to Jersey albumId (where the song's album title doesn't match)
            const songRepairResult = await songModel.updateMany(
                { albumId: jerseyAlbum._id, album: { $ne: "Jersey" } },
                { $set: { albumId: null, album: "Single" } }
            );
            if (songRepairResult.modifiedCount > 0) {
                console.log(`🩹 Reset ${songRepairResult.modifiedCount} songs that were auto-assigned to the 'Jersey' albumId.`);
            }

            // 2. Sync Jersey album's songs list to only contain songs that actually belong to it
            const actualJerseySongs = await songModel.find({ albumId: jerseyAlbum._id });
            const actualJerseySongIds = actualJerseySongs.map(s => s._id);
            
            if (jerseyAlbum.songs.length !== actualJerseySongIds.length) {
                jerseyAlbum.songs = actualJerseySongIds;
                await jerseyAlbum.save();
                console.log(`🩹 Restored 'Jersey' album songs array to only its ${actualJerseySongIds.length} actual songs.`);
            }
        }

        console.log("🎉 Database startup migration hook completed successfully.");
        console.log(`📊 Stats: Migrated ${migratedSongs} legacy song relations, populated ${syncedAlbumSongs} album track indices.`);
    } catch (error) {
        console.error("❌ Database startup migration hook failed:", error.message);
    }
};
