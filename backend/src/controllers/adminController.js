import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Playlist from "../models/Playlist.js";
import Like from "../models/Like.js";
import ListeningHistory from "../models/ListeningHistory.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import Artist from "../models/Artist.js";

// A. USER CONTROL ENDPOINTS
export const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const generatedEmail = email || `${username.trim().toLowerCase()}@mymusic.local`;

        const existing = await User.findOne({ $or: [{ email: generatedEmail }, { username: username.trim() }] });
        if (existing) {
            return res.status(400).json({ success: false, message: "Username already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: username.trim(),
            email: generatedEmail,
            password: hashedPassword,
            role: role || 'user',
            status: 'active'
        });

        await user.save();
        res.status(201).json({ success: true, message: "Account manually created by Admin", user });
    } catch (err) {
        console.error("createUser error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json({ success: true, users });
    } catch (err) {
        console.error("listUsers error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { status: 'suspended' }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User account suspended successfully", user });
    } catch (err) {
        console.error("suspendUser error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { status: 'active' }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User account activated successfully", user });
    } catch (err) {
        console.error("activateUser error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
        
        // Cascade clean up
        await Promise.all([
            Playlist.deleteMany({ creator: id }),
            Like.deleteMany({ user: id }),
            ListeningHistory.deleteMany({ user: id })
        ]);

        res.json({ success: true, message: "User account and custom playlists purged successfully" });
    } catch (err) {
        console.error("deleteUser error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// B. DIAGNOSTIC AUDITING ENDPOINTS (Admin views details of users)
export const viewUserPlaylists = async (req, res) => {
    try {
        const { userId } = req.params;
        const playlists = await Playlist.find({ creator: userId }).populate('songs');
        res.json({ success: true, playlists });
    } catch (err) {
        console.error("viewUserPlaylists error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const viewUserLikedSongs = async (req, res) => {
    try {
        const { userId } = req.params;
        const record = await Like.findOne({ user: userId }).populate('songs');
        res.json({ success: true, songs: record ? record.songs : [] });
    } catch (err) {
        console.error("viewUserLikedSongs error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const viewUserListeningHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await ListeningHistory.find({ user: userId })
            .sort({ listenedAt: -1 })
            .limit(50)
            .populate({
                path: 'song',
                populate: [{ path: 'artistId' }, { path: 'albumId' }]
            });
        res.json({ success: true, history });
    } catch (err) {
        console.error("viewUserListeningHistory error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
