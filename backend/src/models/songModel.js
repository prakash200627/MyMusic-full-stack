import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    artist: { type: String, required: true, index: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', index: true },
    album: { type: String, required: true, index: true },
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'album', index: true },
    genre: { type: String, default: "Unknown Genre" },
    language: { type: String, default: "Unknown Language" },
    duration: { type: String, required: true },
    bitrate: { type: Number },
    year: { type: String },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    audioPublicId: { type: String, required: true },
    imagePublicId: { type: String, required: true }
}, { timestamps: true });

// Virtual getters for complete backward compatibility with existing frontend expectations
songSchema.virtual('file').get(function() {
    return this.audioUrl;
});

songSchema.virtual('image').get(function() {
    return this.coverUrl;
});

songSchema.virtual('name').get(function() {
    return this.title;
});

songSchema.virtual('artistName').get(function() {
    return this.artist;
});

// Enable virtuals in toJSON and toObject conversions
songSchema.set('toJSON', { virtuals: true });
songSchema.set('toObject', { virtuals: true });

const songModel = mongoose.models.song || mongoose.model("song", songSchema);
export default songModel;

