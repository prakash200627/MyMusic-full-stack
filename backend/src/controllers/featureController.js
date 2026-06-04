import Artist from "../models/Artist.js";
import User from "../models/User.js";
import Playlist from "../models/Playlist.js";
import LikedSongs from "../models/LikedSongs.js";
import ListeningHistory from "../models/ListeningHistory.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";

// ==========================================
// 1. Artist Profile & Follow System
// ==========================================
export const getArtistProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findById(id).populate('user', 'username email');
        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });

        // Retrieve popular tracks by this artist
        const tracks = await songModel.find({ artist: id }).limit(5);
        // Retrieve albums by this artist
        const albums = await albumModel.find({ artist: id });

        res.json({
            success: true,
            artist,
            popularSongs: tracks,
            albums
        });
    } catch (error) {
        console.error("getArtistProfile error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const followArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await Artist.findById(id);
        if (!artist) return res.status(404).json({ success: false, message: "Artist not found" });

        // Increment monthly listeners dynamically as a visual follow indicator
        artist.monthlyListeners += 1;
        await artist.save();

        res.json({ success: true, message: "Followed artist successfully", monthlyListeners: artist.monthlyListeners });
    } catch (error) {
        console.error("followArtist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const listArtists = async (req, res) => {
    try {
        const artists = await Artist.find({});
        res.json({ success: true, artists });
    } catch (error) {
        console.error("listArtists error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 2. Debounced Search Engine
// ==========================================
export const searchGlobal = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, songs: [], artists: [], albums: [], playlists: [] });

        const searchRegex = new RegExp(q, "i");

        // Query songs, artists, albums and playlists in parallel
        const [songs, artists, albums, playlists] = await Promise.all([
            songModel.find({ $or: [{ title: searchRegex }, { desc: searchRegex }] }).populate('artist').populate('album'),
            Artist.find({ name: searchRegex }),
            albumModel.find({ $or: [{ title: searchRegex }, { desc: searchRegex }] }).populate('artist'),
            Playlist.find({ $or: [{ name: searchRegex }, { desc: searchRegex }] })
        ]);

        res.json({
            success: true,
            songs: songs.map(s => ({ ...s.toObject(), name: s.title })),
            artists,
            albums: albums.map(a => ({ ...a.toObject(), name: a.title })),
            playlists
        });

    } catch (error) {
        console.error("searchGlobal error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 3. Favorites System (Liked Songs)
// ==========================================
export const likeSong = async (req, res) => {
    try {
        const { userId, songId } = req.body;
        if (!userId || !songId) return res.status(400).json({ success: false, message: "userId and songId required" });

        let likedRecord = await LikedSongs.findOne({ user: userId });
        if (!likedRecord) {
            likedRecord = new LikedSongs({ user: userId, songs: [] });
        }

        if (!likedRecord.songs.includes(songId)) {
            likedRecord.songs.push(songId);
            await likedRecord.save();
        }

        res.json({ success: true, message: "Liked song added successfully" });
    } catch (error) {
        console.error("likeSong error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const unlikeSong = async (req, res) => {
    try {
        const { userId, songId } = req.body;
        if (!userId || !songId) return res.status(400).json({ success: false, message: "userId and songId required" });

        const likedRecord = await LikedSongs.findOne({ user: userId });
        if (likedRecord) {
            likedRecord.songs = likedRecord.songs.filter(id => id.toString() !== songId);
            await likedRecord.save();
        }

        res.json({ success: true, message: "Song unliked successfully" });
    } catch (error) {
        console.error("unlikeSong error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getLikedSongs = async (req, res) => {
    try {
        const { userId } = req.params;
        const likedRecord = await LikedSongs.findOne({ user: userId }).populate({
            path: 'songs',
            populate: [{ path: 'artist' }, { path: 'album' }]
        });

        const songs = likedRecord ? likedRecord.songs : [];
        res.json({
            success: true,
            songs: songs.map(s => {
                const obj = s.toObject();
                return { ...obj, name: obj.title };
            })
        });
    } catch (error) {
        console.error("getLikedSongs error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 4. Playlist System
// ==========================================
export const createPlaylist = async (req, res) => {
    try {
        const { name, desc, creatorId } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "name is required" });

        let targetCreatorId = creatorId;
        if (!targetCreatorId || !/^[0-9a-fA-F]{24}$/.test(targetCreatorId)) {
            const fallbackUser = await User.findOne({});
            if (fallbackUser) {
                targetCreatorId = fallbackUser._id;
            } else {
                const mockUser = new User({
                    username: "MyMusic User",
                    email: "user@mymusic.com",
                    password: "password123",
                    role: "user"
                });
                await mockUser.save();
                targetCreatorId = mockUser._id;
            }
        }

        const playlist = new Playlist({
            name,
            desc: desc || "",
            creator: targetCreatorId,
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
            songs: []
        });

        await playlist.save();
        
        // Push the playlist reference to the user's playlists array
        await User.findByIdAndUpdate(targetCreatorId, { $push: { playlists: playlist._id } });

        res.status(201).json({ success: true, message: "Playlist created", playlist });
    } catch (error) {
        console.error("createPlaylist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPlaylistDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id).populate({
            path: 'songs',
            populate: [{ path: 'artist' }, { path: 'album' }]
        });
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        res.json({ success: true, playlist });
    } catch (error) {
        console.error("getPlaylistDetails error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        await Playlist.findByIdAndDelete(id);
        res.json({ success: true, message: "Playlist deleted successfully" });
    } catch (error) {
        console.error("deletePlaylist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }

        res.json({ success: true, message: "Song added to playlist", playlist });
    } catch (error) {
        console.error("addSongToPlaylist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        res.json({ success: true, message: "Song removed from playlist", playlist });
    } catch (error) {
        console.error("removeSongFromPlaylist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const reorderPlaylistSongs = async (req, res) => {
    try {
        const { playlistId, songIds } = req.body;
        if (!playlistId || !songIds) {
            return res.status(400).json({ success: false, message: "playlistId and songIds array are required" });
        }
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        playlist.songs = songIds;
        await playlist.save();

        res.json({ success: true, message: "Playlist reordered successfully", playlist });
    } catch (error) {
        console.error("reorderPlaylistSongs error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { playlistId, name, desc } = req.body;
        if (!playlistId) return res.status(400).json({ success: false, message: "playlistId is required" });

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (name !== undefined) playlist.name = name;
        if (desc !== undefined) playlist.desc = desc;

        await playlist.save();
        res.json({ success: true, message: "Playlist updated successfully", playlist });
    } catch (error) {
        console.error("updatePlaylist error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const listPlaylists = async (req, res) => {
    try {
        let { userId } = req.params;
        
        if (!userId || userId === "undefined" || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            const fallbackUser = await User.findOne({});
            if (fallbackUser) {
                userId = fallbackUser._id;
            } else {
                const mockUser = new User({
                    username: "MyMusic User",
                    email: "user@mymusic.com",
                    password: "password123",
                    role: "user"
                });
                await mockUser.save();
                userId = mockUser._id;
            }
        }
        
        const playlists = await Playlist.find({ creator: userId }).populate('songs');
        res.json({ success: true, playlists });
    } catch (error) {
        console.error("listPlaylists error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 5. Listening History
// ==========================================
export const logHistory = async (req, res) => {
    try {
        const { userId, songId } = req.body;
        if (!userId || !songId) return res.status(400).json({ success: false, message: "userId and songId required" });

        const history = new ListeningHistory({ user: userId, song: songId });
        await history.save();

        res.json({ success: true, message: "Listening history logged" });
    } catch (error) {
        console.error("logHistory error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await ListeningHistory.find({ user: userId })
            .sort({ playedAt: -1 })
            .limit(10)
            .populate({
                path: 'song',
                populate: [{ path: 'artist' }, { path: 'album' }]
            });

        res.json({
            success: true,
            songs: history.map(h => {
                if (!h.song) return null;
                const obj = h.song.toObject();
                return { ...obj, name: obj.title, playedAt: h.playedAt };
            }).filter(Boolean)
        });
    } catch (error) {
        console.error("getHistory error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 6. Recommendation Engine
// ==========================================
export const getRecommendations = async (req, res) => {
    try {
        const { artistId, albumId } = req.query;
        let query = {};

        if (artistId && /^[0-9a-fA-F]{24}$/.test(artistId)) {
            query.artist = artistId;
        } else if (albumId && /^[0-9a-fA-F]{24}$/.test(albumId)) {
            query.album = albumId;
        }

        const recommendations = await songModel.find(query).limit(5).populate('artist').populate('album');
        res.json({
            success: true,
            songs: recommendations.map(s => {
                const obj = s.toObject();
                return { ...obj, name: obj.title };
            })
        });
    } catch (error) {
        console.error("getRecommendations error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
