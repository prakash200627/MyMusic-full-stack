import express from "express";
import upload from "../middleware/multer.js";
import { addSong, listSongs, removeSong, updateSong } from "../controllers/songController.js";

const songRouter = express.Router();

songRouter.post("/add", upload.fields([{ name: "image", maxCount: 1 }, { name: "audio", maxCount: 1 }]), addSong);
songRouter.get("/list", listSongs);
songRouter.post("/remove", removeSong);
// allow RESTful delete by id
songRouter.delete("/:id", removeSong);
// allow RESTful update by id
songRouter.put("/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "audio", maxCount: 1 }]), updateSong);


export default songRouter;