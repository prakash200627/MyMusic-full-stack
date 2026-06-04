import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    type: { type: String, enum: ['song', 'artist', 'album'], required: true, index: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    plays: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    playlistAdds: { type: Number, default: 0 }
}, { timestamps: true });

const Analytics = mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);
export default Analytics;
