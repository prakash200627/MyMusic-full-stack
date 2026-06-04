import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    desc: { type: String, default: "" },
    cover: { type: String, default: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }] // refers to 'song' model name
}, { timestamps: true });

const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);
export default Playlist;
