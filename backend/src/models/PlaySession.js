import mongoose from "mongoose";

const playSessionSchema = new mongoose.Schema({
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    activeSong: { type: mongoose.Schema.Types.ObjectId, ref: 'song' },
    isPlaying: { type: Boolean, default: false },
    progressMs: { type: Number, default: 0 },
    listeners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const PlaySession = mongoose.models.PlaySession || mongoose.model("PlaySession", playSessionSchema);
export default PlaySession;
