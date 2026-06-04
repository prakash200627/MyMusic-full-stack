import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { 
    createUser, listUsers, suspendUser, activateUser, deleteUser,
    viewUserPlaylists, viewUserLikedSongs, viewUserListeningHistory
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Tightly lock all administrative routes under protect and authorize('admin') RBAC guards
adminRouter.use(protect);
adminRouter.use(authorize('admin'));

adminRouter.post("/users/create", createUser);
adminRouter.get("/users/list", listUsers);
adminRouter.put("/users/:id/suspend", suspendUser);
adminRouter.put("/users/:id/activate", activateUser);
adminRouter.delete("/users/:id", deleteUser);

adminRouter.get("/user-playlists/:userId", viewUserPlaylists);
adminRouter.get("/user-likes/:userId", viewUserLikedSongs);
adminRouter.get("/user-history/:userId", viewUserListeningHistory);

export default adminRouter;
