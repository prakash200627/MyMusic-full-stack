import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    desc: { type: String, default: "" },
    image: { type: String, required: true },
    bgColor: { type: String, default: "#121212" },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true, index: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }] // refers to 'song' model name
}, { timestamps: true });

const albumModel = mongoose.models.album || mongoose.model("album", albumSchema);
export default albumModel;
