import express from "express";
import { protect } from "../middleware/auth.js";
import { 
    createPlaylist, updatePlaylist, deletePlaylist, listPlaylists, getPlaylistDetails,
    addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs,
    likeSong, unlikeSong, getLikedSongs, shareItem, searchGlobal,
    saveAlbum, unsaveAlbum, getSavedAlbums
} from "../controllers/userController.js";

const userRouter = express.Router();

// A. PUBLIC SHAREABLE LINKS RESOLUTION (Unprotected so guests can load title cards)
userRouter.get("/share/:type/:id", shareItem);

// B. PROTECTED USER ACTIONS (Require standard login protection middleware)
userRouter.use(protect);

userRouter.get("/search", searchGlobal);
userRouter.get("/status", (req, res) => {
    res.json({ success: true, status: req.user.status });
});

// Playlist CRUD Endpoints
userRouter.post("/playlist/create", createPlaylist);
userRouter.put("/playlist/:id", updatePlaylist);
userRouter.delete("/playlist/:id", deletePlaylist);
userRouter.get("/playlist/list", listPlaylists);
userRouter.get("/playlist/:id", getPlaylistDetails);
userRouter.post("/playlist/add-song", addSongToPlaylist);
userRouter.post("/playlist/remove-song", removeSongFromPlaylist);
userRouter.post("/playlist/reorder", reorderPlaylistSongs);

// Likes / Favorites Endpoints
userRouter.post("/likes/toggle", likeSong);
userRouter.post("/likes/unlike", unlikeSong);
userRouter.get("/likes/list", getLikedSongs);

// Saved Albums Endpoints
userRouter.post("/albums/save", saveAlbum);
userRouter.post("/albums/unsave", unsaveAlbum);
userRouter.get("/albums/saved", getSavedAlbums);

export default userRouter;
