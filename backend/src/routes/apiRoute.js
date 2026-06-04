import express from "express";
import songModel from "../models/songModel.js";

const apiRouter = express.Router();

// GET /api/songs - Paginated list of songs
apiRouter.get("/songs", async (req, res) => {
    try {
        let { page = 1, limit = 200 } = req.query; // Default to 200 to return all 171 songs if no limit specified
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;
        const totalSongs = await songModel.countDocuments();
        const songs = await songModel.find()
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            songs,
            totalSongs,
            totalPages: Math.ceil(totalSongs / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/songs/:id - Get song by ID
apiRouter.get("/songs/:id", async (req, res) => {
    try {
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }
        const song = await songModel.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }
        res.json({ success: true, song });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/search - Live search by title, artist, album, language
apiRouter.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, songs: [] });
        }

        const regex = new RegExp(q, "i");
        const songs = await songModel.find({
            $or: [
                { title: regex },
                { artist: regex },
                { album: regex },
                { language: regex }
            ]
        });

        res.json({ success: true, songs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/artists - List all unique artists
apiRouter.get("/artists", async (req, res) => {
    try {
        const artists = await songModel.distinct("artist");
        res.json({ success: true, artists });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/albums - List all unique albums
apiRouter.get("/albums", async (req, res) => {
    try {
        const albums = await songModel.distinct("album");
        res.json({ success: true, albums });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default apiRouter;
