import mongoose from "mongoose";

const likedSongsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }] // refers to 'song' model name
}, { timestamps: true });

const LikedSongs = mongoose.models.LikedSongs || mongoose.model("LikedSongs", likedSongsSchema);
export default LikedSongs;
