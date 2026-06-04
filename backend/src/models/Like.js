import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'song' }] // refers to 'song' model name
}, { timestamps: true });

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);
export default Like;
