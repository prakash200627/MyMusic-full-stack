import User from "../models/User.js";
import Playlist from "../models/Playlist.js";
import Like from "../models/Like.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import Artist from "../models/Artist.js";
import ListeningHistory from "../models/ListeningHistory.js";
import Analytics from "../models/Analytics.js";

// A. LOG PLAY TIMING EVENT (>30 Seconds Callback)
export const logPlayEvent = async (req, res) => {
    try {
        const { songId, durationSeconds } = req.body;
        const userId = req.user._id;

        if (!songId) return res.status(400).json({ success: false, message: "songId is required" });

        const song = await songModel.findById(songId);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        // 1. Create a detailed listening history record
        const history = new ListeningHistory({
            user: userId,
            song: songId,
            durationSeconds: durationSeconds || 30
        });
        await history.save();

        // 2. Perform concurrent atomic increments for Analytics metrics
        await Promise.all([
            // Song Plays
            Analytics.findOneAndUpdate(
                { type: 'song', referenceId: songId },
                { $inc: { plays: 1 } },
                { upsert: true, new: true }
            ),
            // Artist Plays
            Analytics.findOneAndUpdate(
                { type: 'artist', referenceId: song.artistId },
                { $inc: { plays: 1 } },
                { upsert: true, new: true }
            ),
            // Album Plays
            song.albumId ? Analytics.findOneAndUpdate(
                { type: 'album', referenceId: song.albumId },
                { $inc: { plays: 1 } },
                { upsert: true, new: true }
            ) : Promise.resolve()
        ]);

        res.json({ success: true, message: "Listen event logged and platform play analytics incremented" });
    } catch (err) {
        console.error("logPlayEvent error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// B. USER PORTFOLIO / LISTENING TIME ANALYTICS
export const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Total Listening Time
        const totalDuration = await ListeningHistory.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, totalSeconds: { $sum: "$durationSeconds" } } }
        ]);
        const seconds = totalDuration[0] ? totalDuration[0].totalSeconds : 0;
        const minutes = Math.floor(seconds / 60);

        // 2. Most Played Songs (Top 5)
        const topSongs = await ListeningHistory.aggregate([
            { $match: { user: userId } },
            { $group: { _id: "$song", playCount: { $sum: 1 } } },
            { $sort: { playCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'songs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'songDetails'
                }
            },
            { $unwind: "$songDetails" }
        ]);

        // 3. Most Played Artists (Top 3)
        const topArtists = await ListeningHistory.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: 'songs',
                    localField: 'song',
                    foreignField: '_id',
                    as: 'songDetails'
                }
            },
            { $unwind: "$songDetails" },
            { $group: { _id: "$songDetails.artistId", playCount: { $sum: 1 } } },
            { $sort: { playCount: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'artists',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'artistDetails'
                }
            },
            { $unwind: "$artistDetails" }
        ]);

        res.json({
            success: true,
            listeningMinutes: minutes,
            mostPlayedSongs: topSongs.map(item => ({
                id: item._id,
                title: item.songDetails.title,
                image: item.songDetails.image,
                plays: item.playCount
            })),
            mostPlayedArtists: topArtists.map(item => ({
                id: item._id,
                name: item.artistDetails.name,
                image: item.artistDetails.image,
                plays: item.playCount
            }))
        });

    } catch (err) {
        console.error("getUserAnalytics error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// C. PLATFORM AUDITING ANALYTICS (Admin Dashboard Metrics)
export const getAdminAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalSongs,
            totalAlbums,
            totalPlaysRecord
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ status: 'active' }),
            songModel.countDocuments({}),
            albumModel.countDocuments({}),
            Analytics.aggregate([
                { $match: { type: 'song' } },
                { $group: { _id: null, sum: { $sum: "$plays" } } }
            ])
        ]);

        const totalPlays = totalPlaysRecord[0] ? totalPlaysRecord[0].sum : 0;

        // Most Played Songs (Platform General)
        const popularSongs = await Analytics.find({ type: 'song' })
            .sort({ plays: -1 })
            .limit(5)
            .populate({
                path: 'referenceId',
                model: 'song',
                populate: [{ path: 'artistId' }]
            });

        // Most Played Albums
        const popularAlbums = await Analytics.find({ type: 'album' })
            .sort({ plays: -1 })
            .limit(5)
            .populate({
                path: 'referenceId',
                model: 'album',
                populate: [{ path: 'artistId' }]
            });

        // Most Followed Artists (Simple mock or actual DB sorting)
        const popularArtists = await Artist.find({})
            .sort({ followersCount: -1 })
            .limit(5);

        res.json({
            success: true,
            totalUsers,
            activeUsers,
            totalSongs,
            totalAlbums,
            totalPlays,
            mostPlayedSongs: popularSongs.map(s => {
                const details = s.referenceId;
                if (!details) return null;
                return {
                    id: details._id,
                    title: details.title,
                    image: details.image,
                    artist: details.artistId ? details.artistId.name : "MyMusic Artist",
                    plays: s.plays
                };
            }).filter(Boolean),
            mostPlayedAlbums: popularAlbums.map(a => {
                const details = a.referenceId;
                if (!details) return null;
                return {
                    id: details._id,
                    title: details.title,
                    image: details.image,
                    plays: a.plays
                };
            }).filter(Boolean),
            mostFollowedArtists: popularArtists.map(a => ({
                id: a._id,
                name: a.name,
                image: a.image,
                followers: a.followersCount
            }))
        });

    } catch (err) {
        console.error("getAdminAnalytics error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
