import express from "express";
import { 
    getArtistProfile, followArtist, listArtists,
    searchGlobal,
    likeSong, unlikeSong, getLikedSongs,
    createPlaylist, getPlaylistDetails, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs, updatePlaylist, listPlaylists,
    logHistory, getHistory,
    getRecommendations
} from "../controllers/featureController.js";

const featureRouter = express.Router();

// Artist Endpoints
featureRouter.get("/artist/list", listArtists);
featureRouter.get("/artist/:id", getArtistProfile);
featureRouter.post("/artist/:id/follow", followArtist);

// Search Endpoints
featureRouter.get("/search", searchGlobal);

// Favorites Endpoints
featureRouter.post("/favorites/like", likeSong);
featureRouter.post("/favorites/unlike", unlikeSong);
featureRouter.get("/favorites/list/:userId", getLikedSongs);

// Playlist Endpoints
featureRouter.post("/playlist/create", createPlaylist);
featureRouter.get("/playlist/list/:userId", listPlaylists);
featureRouter.get("/playlist/:id", getPlaylistDetails);
featureRouter.delete("/playlist/:id", deletePlaylist);
featureRouter.post("/playlist/add-song", addSongToPlaylist);
featureRouter.post("/playlist/remove-song", removeSongFromPlaylist);
featureRouter.post("/playlist/reorder", reorderPlaylistSongs);
featureRouter.post("/playlist/update", updatePlaylist);

// Listening History Endpoints
featureRouter.post("/history/log", logHistory);
featureRouter.get("/history/list/:userId", getHistory);

// Recommendations Endpoint
featureRouter.get("/recommendations", getRecommendations);

export default featureRouter;
