import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "fallback_refresh_secret";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "36500d" });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: "36500d" });
    return { accessToken, refreshToken };
};

// Admin manually creates users, so we retain signup as a protected or fallback endpoint
export const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const generatedEmail = email || `${username.trim().toLowerCase()}@mymusic.local`;

        const existingUser = await User.findOne({ $or: [{ email: generatedEmail }, { username: username.trim() }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role && ['user', 'admin'].includes(role) ? role : 'user';

        const user = new User({
            username: username.trim(),
            email: generatedEmail,
            password: hashedPassword,
            role: userRole,
            status: 'pending' // default status is pending, requiring admin approval
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration successful! Your account is pending administrator approval before you can log in.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Failed to register user" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identifier = username || email;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const cleanIdentifier = identifier.trim();
        const user = await User.findOne({
            $or: [
                { username: cleanIdentifier },
                { email: cleanIdentifier },
                { username: cleanIdentifier.toLowerCase() },
                { email: cleanIdentifier.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid username or password" });
        }

        if (user.status !== "active") {
            return res.status(403).json({ success: false, message: `Your account is currently ${user.status}. Please contact the administrator.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid username or password" });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: "Logged in successfully",
            token: accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Failed to log in" });
    }
};

export const refresh = async (req, res) => {
    try {
        const cookies = req.cookies;
        const refreshToken = cookies ? cookies.refreshToken : req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Unauthorized refresh access" });
        }

        jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ success: false, message: "Invalid or expired token" });

            const user = await User.findById(decoded.id);
            if (!user || user.status !== "active") {
                return res.status(403).json({ success: false, message: "Account suspended or not found" });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ success: true, token: accessToken });
        });

    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ success: false, message: "Token rotation failed" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Failed to log out" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect old password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("changePassword error:", error);
        res.status(500).json({ success: false, message: "Failed to change password", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: "userId and newPassword are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: "Password manually override complete" });
    } catch (error) {
        console.error("resetPassword error:", error);
        res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
    }
};
