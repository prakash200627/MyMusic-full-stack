import express from "express";
import rateLimit from "express-rate-limit";
import { signup, login, refresh, logout, changePassword, resetPassword } from "../controllers/authController.js";

const authRouter = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many authentication requests from this IP, please try again after 15 minutes" }
});

authRouter.post("/signup", authLimiter, signup);
authRouter.post("/login", authLimiter, login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/change-password", changePassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
