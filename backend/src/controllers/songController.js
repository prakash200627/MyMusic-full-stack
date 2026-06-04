import { v2 as cloudinary } from "cloudinary";
import { parseFile } from 'music-metadata';
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";

export const addSong = async (req, res) => {
    try {
        const { title, name, album, artist, genre, language, bitrate, year, albumId } = req.body;

        if (!req.files || !req.files.audio || !req.files.image) {
            return res.status(400).json({ success: false, message: "audio and image files are required" });
        }

        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        const [audioUpload, imageUpload] = await Promise.all([
            cloudinary.uploader.upload(audioFile.path, { folder: "mymusic/audio", resource_type: "video" }),
            cloudinary.uploader.upload(imageFile.path, { folder: "mymusic/images", resource_type: "image" })
        ]);

        let duration = '0:00';
        try {
            const metadata = await parseFile(audioFile.path);
            const seconds = metadata.format?.duration || 0;
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
            duration = `${mins}:${secs}`;
        } catch (metaErr) {
            console.warn('Could not parse audio duration, falling back to 0:00', metaErr.message);
        }

        // Resolve Album Name from albumId or raw album name
        let resolvedAlbumName = album || "Unknown Album";
        let targetAlbumId = null;
        if (albumId && albumId !== 'none') {
            const foundAlbum = await albumModel.findById(albumId);
            if (foundAlbum) {
                resolvedAlbumName = foundAlbum.title;
                targetAlbumId = foundAlbum._id;
            }
        }

        const song = new songModel({
            title: title || name || "Untitled",
            artist: artist || "MyMusic Artist",
            album: resolvedAlbumName,
            albumId: targetAlbumId,
            genre: genre || "Unknown Genre",
            language: language || "Unknown Language",
            duration,
            bitrate: bitrate ? parseInt(bitrate) : 128,
            year: year || new Date().getFullYear().toString(),
            audioUrl: audioUpload.secure_url,
            coverUrl: imageUpload.secure_url,
            audioPublicId: audioUpload.public_id,
            imagePublicId: imageUpload.public_id
        });

        await song.save();

        // If album was selected, we sync it by adding the song ID to the album songs list!
        if (targetAlbumId) {
            await albumModel.findByIdAndUpdate(targetAlbumId, { $addToSet: { songs: song._id } });
        }

        return res.status(201).json({ success: true, message: "Song added successfully to MyMusic library", song });

    } catch (error) {
        console.error("Error in addSong:", error);
        return res.status(500).json({ success: false, message: "Failed to add song", error: error.message });
    }
};

export const listSongs = async (req, res) => {
    try {
        const songs = await songModel.find({});

        // Retain visual properties compatibility for display list maps
        const mappedSongs = songs.map(s => {
            const obj = s.toObject();
            return {
                ...obj,
                name: obj.title, // map title to name for visual elements
                album: obj.album || "",
                artistName: obj.artist || "MyMusic Artist"
            };
        });

        res.json({ success: true, songs: mappedSongs });
    } catch (err) {
        console.error('listSongs error:', err);
        res.json({ success: false, error: err.message });
    }
};

export const removeSong = async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        if (!id) return res.status(400).json({ success: false, message: "id is required" });
        
        const deleted = await songModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Song not found" });

        // Sync and pull from albums containing this song
        await albumModel.updateMany({}, { $pull: { songs: id } });

        res.json({ success: true, message: "Song removed from platform library" });
    } catch (err) {
        console.error("removeSong error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await songModel.findById(id);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        const songTitle = req.body.title || req.body.name;
        if (songTitle) song.title = songTitle;
        if (req.body.artist) song.artist = req.body.artist;
        if (req.body.album) song.album = req.body.album;
        if (req.body.genre !== undefined) song.genre = req.body.genre;
        if (req.body.language !== undefined) song.language = req.body.language;
        if (req.body.year !== undefined) song.year = req.body.year;
        if (req.body.bitrate !== undefined) song.bitrate = parseInt(req.body.bitrate);
        if (req.body.duration) song.duration = req.body.duration;

        let newImageFile = req.files && req.files.image ? req.files.image[0] : null;
        let newAudioFile = req.files && req.files.audio ? req.files.audio[0] : null;

        if (newImageFile) {
            const imageUpload = await cloudinary.uploader.upload(newImageFile.path, { folder: "mymusic/images", resource_type: "image" });
            song.coverUrl = imageUpload.secure_url;
            song.imagePublicId = imageUpload.public_id;
        }

        if (newAudioFile) {
            const audioUpload = await cloudinary.uploader.upload(newAudioFile.path, { folder: "mymusic/audio", resource_type: "video" });
            song.audioUrl = audioUpload.secure_url;
            song.audioPublicId = audioUpload.public_id;
            try {
                const metadata = await parseFile(newAudioFile.path);
                const seconds = metadata.format?.duration || 0;
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
                song.duration = `${mins}:${secs}`;
            } catch (metaErr) {
                console.warn('Could not parse audio duration for update:', metaErr.message);
            }
        }

        if (req.body.albumId !== undefined) {
            const albumId = req.body.albumId;
            if (albumId && albumId !== 'none') {
                const foundAlbum = await albumModel.findById(albumId);
                if (foundAlbum) {
                    // Remove from previous album songs list if it has changed
                    if (song.albumId && String(song.albumId) !== String(albumId)) {
                        await albumModel.findByIdAndUpdate(song.albumId, { $pull: { songs: song._id } });
                    }
                    song.album = foundAlbum.title;
                    song.albumId = foundAlbum._id;
                    await albumModel.findByIdAndUpdate(albumId, { $addToSet: { songs: song._id } });
                }
            } else {
                // If set to 'none', dissociate completely
                if (song.albumId) {
                    await albumModel.findByIdAndUpdate(song.albumId, { $pull: { songs: song._id } });
                }
                song.album = "Single";
                song.albumId = null;
            }
        }

        await song.save();
        res.json({ success: true, message: "Song updated successfully in platform catalog", song });
    } catch (error) {
        console.error("Error in updateSong:", error);
        res.status(500).json({ success: false, message: "Failed to update song", error: error.message });
    }
};