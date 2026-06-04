import User from "../models/User.js";
import Playlist from "../models/Playlist.js";
import Like from "../models/Like.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import Artist from "../models/Artist.js";

// A. USER PLAYLIST SYSTEM
export const createPlaylist = async (req, res) => {
    try {
        const { name, desc } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "name is required" });

        const targetCreatorId = req.user._id;

        const playlist = new Playlist({
            name,
            desc: desc || "A custom user playlist",
            creator: targetCreatorId,
            songs: []
        });

        await playlist.save();
        res.status(201).json({ success: true, message: "Playlist created successfully", playlist });
    } catch (err) {
        console.error("createPlaylist error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc, cover } = req.body;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }

        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (name !== undefined) playlist.name = name;
        if (desc !== undefined) playlist.desc = desc;
        if (cover !== undefined) playlist.cover = cover;

        await playlist.save();
        res.json({ success: true, message: "Playlist updated successfully", playlist });
    } catch (err) {
        console.error("updatePlaylist error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }
        const deleted = await Playlist.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Playlist not found" });
        res.json({ success: true, message: "Playlist deleted successfully" });
    } catch (err) {
        console.error("deletePlaylist error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const listPlaylists = async (req, res) => {
    try {
        const queryUserId = req.user._id;

        const playlists = await Playlist.find({ creator: queryUserId }).populate({
            path: 'songs',
            populate: [{ path: 'artistId' }, { path: 'albumId' }]
        });
        res.json({ success: true, playlists });
    } catch (err) {
        console.error("listPlaylists error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPlaylistDetails = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }
        const playlist = await Playlist.findById(id).populate({
            path: 'songs',
            populate: [{ path: 'artistId' }, { path: 'albumId' }]
        });
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
        res.json({ success: true, playlist });
    } catch (err) {
        console.error("getPlaylistDetails error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        if (!/^[0-9a-fA-F]{24}$/.test(playlistId) || !/^[0-9a-fA-F]{24}$/.test(songId)) {
            return res.status(400).json({ success: false, message: "Invalid playlistId or songId" });
        }
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }

        res.json({ success: true, message: "Song added to playlist reference library", playlist });
    } catch (err) {
        console.error("addSongToPlaylist error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        if (!/^[0-9a-fA-F]{24}$/.test(playlistId) || !/^[0-9a-fA-F]{24}$/.test(songId)) {
            return res.status(400).json({ success: false, message: "Invalid playlistId or songId" });
        }
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        res.json({ success: true, message: "Song removed from playlist", playlist });
    } catch (err) {
        console.error("removeSongFromPlaylist error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const reorderPlaylistSongs = async (req, res) => {
    try {
        const { playlistId, songIds } = req.body;
        if (!playlistId || !songIds) {
            return res.status(400).json({ success: false, message: "playlistId and songIds array are required" });
        }
        if (!/^[0-9a-fA-F]{24}$/.test(playlistId)) {
            return res.status(400).json({ success: false, message: "Invalid playlistId" });
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        playlist.songs = songIds;
        await playlist.save();
        res.json({ success: true, message: "Playlist reordered successfully", playlist });
    } catch (err) {
        console.error("reorderPlaylistSongs error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// B. USER LIKES / FAVORITES SYSTEM
export const likeSong = async (req, res) => {
    try {
        const { songId } = req.body;
        if (!/^[0-9a-fA-F]{24}$/.test(songId)) {
            return res.status(400).json({ success: false, message: "Invalid songId" });
        }
        const targetUserId = req.user._id;

        let likeRecord = await Like.findOne({ user: targetUserId });
        if (!likeRecord) {
            likeRecord = new Like({ user: targetUserId, songs: [] });
        }

        if (!likeRecord.songs.some(id => String(id) === String(songId))) {
            likeRecord.songs.push(songId);
            await likeRecord.save();
        }

        res.json({ success: true, message: "Song liked successfully" });
    } catch (err) {
        console.error("likeSong error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const unlikeSong = async (req, res) => {
    try {
        const { songId } = req.body;
        if (!/^[0-9a-fA-F]{24}$/.test(songId)) {
            return res.status(400).json({ success: false, message: "Invalid songId" });
        }
        const targetUserId = req.user._id;

        const likeRecord = await Like.findOne({ user: targetUserId });
        if (likeRecord) {
            likeRecord.songs = likeRecord.songs.filter(id => id.toString() !== songId);
            await likeRecord.save();
        }

        res.json({ success: true, message: "Song unliked successfully" });
    } catch (err) {
        console.error("unlikeSong error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getLikedSongs = async (req, res) => {
    try {
        const targetUserId = req.user._id;

        const likeRecord = await Like.findOne({ user: targetUserId }).populate({
            path: 'songs',
            populate: [{ path: 'artistId' }, { path: 'albumId' }]
        });

        const songs = likeRecord ? (likeRecord.songs || []).filter(s => s !== null && s !== undefined) : [];
        const mapped = songs.map(s => {
            const obj = s.toObject();
            return {
                ...obj,
                name: obj.title,
                album: obj.albumId ? obj.albumId.title : "",
                artistName: obj.artistId ? obj.artistId.name : "MyMusic Artist"
            };
        });

        res.json({ success: true, songs: mapped });
    } catch (err) {
        console.error("getLikedSongs error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// C. SHARING SYSTEM: GENERATE SHAREABLE METADATA LINKS
export const shareItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(404).json({ success: false, message: "Requested streaming item not found" });
        }
        let title = "";
        let subtitle = "";
        let details = {};

        if (type === "song") {
            const song = await songModel.findById(id).populate('artistId');
            if (song) {
                title = song.title;
                subtitle = song.artistId ? song.artistId.name : "MyMusic Singer";
                details = song.toObject();
            }
        } else if (type === "album") {
            const album = await albumModel.findById(id).populate('artistId');
            if (album) {
                title = album.title;
                subtitle = album.artistId ? album.artistId.name : "MyMusic Release";
                details = album.toObject();
            }
        } else if (type === "playlist") {
            const playlist = await Playlist.findById(id).populate('creator');
            if (playlist) {
                title = playlist.name;
                subtitle = playlist.creator ? `Playlist by ${playlist.creator.username}` : "User Playlist";
                details = playlist.toObject();
            }
        }

        if (!title) {
            return res.status(404).json({ success: false, message: "Requested streaming item not found" });
        }

        res.json({
            success: true,
            title,
            subtitle,
            shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${type}/${id}`,
            details
        });
    } catch (err) {
        console.error("shareItem error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const searchGlobal = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, songs: [], artists: [], albums: [] });

        const searchRegex = new RegExp(q, "i");

        const [songs, artists, albums] = await Promise.all([
            songModel.find({ $or: [{ title: searchRegex }, { desc: searchRegex }] }).populate('artistId').populate('albumId'),
            Artist.find({ name: searchRegex }),
            albumModel.find({ $or: [{ title: searchRegex }, { desc: searchRegex }] }).populate('artistId')
        ]);

        res.json({
            success: true,
            songs: songs.map(s => ({ ...s.toObject(), name: s.title })),
            artists,
            albums: albums.map(a => ({ ...a.toObject(), name: a.title }))
        });
    } catch (err) {
        console.error("searchGlobal error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// C. USER ALBUM LIBRARY SYSTEM
export const saveAlbum = async (req, res) => {
    try {
        const { albumId } = req.body;
        const userId = req.user._id;
        if (!albumId) {
            return res.status(400).json({ success: false, message: "albumId is required" });
        }
        if (albumId !== 'mix' && !/^[0-9a-fA-F]{24}$/.test(albumId)) {
            return res.status(400).json({ success: false, message: "Invalid albumId" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (albumId === 'mix') {
            user.saveMainAlbum = true;
            await user.save();
            return res.json({ success: true, message: "Main Album saved to library successfully" });
        }

        if (user.savedAlbums && user.savedAlbums.includes(albumId)) {
            return res.json({ success: true, message: "Album already saved in library" });
        }

        if (!user.savedAlbums) user.savedAlbums = [];
        user.savedAlbums.push(albumId);
        await user.save();

        res.json({ success: true, message: "Album saved to library successfully" });
    } catch (err) {
        console.error("saveAlbum error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const unsaveAlbum = async (req, res) => {
    try {
        const { albumId } = req.body;
        const userId = req.user._id;
        if (!albumId) {
            return res.status(400).json({ success: false, message: "albumId is required" });
        }
        if (albumId !== 'mix' && !/^[0-9a-fA-F]{24}$/.test(albumId)) {
            return res.status(400).json({ success: false, message: "Invalid albumId" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (albumId === 'mix') {
            user.saveMainAlbum = false;
            await user.save();
            return res.json({ success: true, message: "Main Album removed from library successfully" });
        }

        if (user.savedAlbums) {
            user.savedAlbums = user.savedAlbums.filter(id => String(id) !== String(albumId));
            await user.save();
        }

        res.json({ success: true, message: "Album removed from library successfully" });
    } catch (err) {
        console.error("unsaveAlbum error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSavedAlbums = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({
            path: 'savedAlbums',
            populate: { path: 'artistId' }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const albums = (user.savedAlbums || []).filter(a => a !== null && a !== undefined).map(a => ({
            ...a.toObject(),
            name: a.title
        }));

        if (user.saveMainAlbum) {
            albums.unshift({
                _id: 'mix',
                name: 'Main Album',
                desc: 'All songs from all albums',
                image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'
            });
        }

        res.json({ 
            success: true, 
            albums
        });
    } catch (err) {
        console.error("getSavedAlbums error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
