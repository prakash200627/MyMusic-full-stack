import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";
import songModel from "../models/songModel.js";
import Artist from "../models/Artist.js";

export const addAlbum = async (req, res) => {
    try {
        const { title, desc, artistId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "image file is required" });
        }

        const imageFile = req.file;
        let imageUrl = imageFile.path;
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload?.secure_url || imageUrl;
        } catch (cloudErr) {
            console.warn("Cloudinary upload failed for album cover:", cloudErr.message);
        }

        let targetArtistId = artistId && /^[0-9a-fA-F]{24}$/.test(artistId) ? artistId : null;
        if (!targetArtistId) {
            const fallbackArtist = await Artist.findOne({});
            if (fallbackArtist) {
                targetArtistId = fallbackArtist._id;
            }
        }

        const album = new albumModel({
            title: title || "Untitled Album",
            desc: desc || "",
            bgColor: "#121212", // Clean default background color
            image: imageUrl,
            artistId: targetArtistId,
            songs: []
        });

        await album.save();
        return res.status(201).json({ success: true, message: "Album created successfully in MyMusic library", album });

    } catch (error) {
        console.error("Error adding album:", error);
        return res.status(500).json({ success: false, message: "Failed to add album", error: error.message });
    }
};

export const listAlbums = async (req, res) => {
    try {
        const albums = await albumModel.find({}).populate('artistId');
        
        const mapped = albums.map(a => {
            const obj = a.toObject();
            return {
                ...obj,
                name: obj.title, // map title to name for frontend component card
                artistName: obj.artistId ? obj.artistId.name : "MyMusic Artist"
            };
        });

        return res.json({ success: true, albums: mapped });
    } catch (err) {
        console.error("listAlbums error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const removeAlbum = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.body._id;
        if (!id) return res.status(400).json({ success: false, message: "id is required" });
        
        const deleted = await albumModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Album not found" });
        
        // Safely nullify song associations using the new albumId relational property
        await songModel.updateMany({ albumId: id }, { $unset: { albumId: "" } });

        return res.json({ success: true, message: "Album removed successfully from platform catalog" });
    } catch (err) {
        console.error("removeAlbum error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await albumModel.findById(id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        if (req.body.title) album.title = req.body.title;
        if (req.body.desc !== undefined) album.desc = req.body.desc;
        if (req.body.artistId) album.artistId = req.body.artistId;

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            album.image = imageUpload.secure_url;
        }

        await album.save();
        res.json({ success: true, message: "Album updated successfully in MyMusic catalog", album });
    } catch (error) {
        console.error("Error in updateAlbum:", error);
        res.status(500).json({ success: false, message: "Failed to update album", error: error.message });
    }
};