import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token || token === "null" || token === "undefined") {
            const guestUser = await User.findOne({ email: "guest@mymusic.local" }) || await User.findOne({});
            if (guestUser) {
                req.user = guestUser;
                return next();
            }
            return res.status(401).json({ success: false, message: "Not authorized, token missing and no guest profile" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User not found, please login again" });
            }
            if (req.user.status === 'suspended') {
                return res.status(403).json({ success: false, message: "Your account is suspended. Please contact the administrator." });
            }
            next();
        } catch (jwtErr) {
            console.error("JWT verify failed:", jwtErr.message);
            return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
        }
    } catch (error) {
        console.error("Auth protect middleware error:", error);
        return res.status(401).json({ success: false, message: "Not authorized, invalid session" });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access forbidden: insufficient scopes" });
        }
        next();
    };
};
