import express from "express";
import { addAlbum, listAlbums, removeAlbum, updateAlbum } from "../controllers/albumController.js";
import upload from "../middleware/multer.js";

const albumRouter = express.Router();

albumRouter.post("/add", upload.single("image"), addAlbum);
albumRouter.get("/list", listAlbums);
albumRouter.post("/remove", removeAlbum);

// RESTful delete by id
albumRouter.delete("/:id", removeAlbum);
// RESTful update by id
albumRouter.put("/:id", upload.single("image"), updateAlbum);

export default albumRouter;