import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, username, bio, location, website, phone, birthday, preferences, social } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name || "",
        email: email || "",
        username: username || "",
        bio: bio || "",
        location: location || "",
        website: website || "",
        phone: phone || "",
        birthday: birthday || null,
        preferences: preferences || {
          language: "English",
          timezone: "PST (UTC-8)",
          dateFormat: "MM/DD/YYYY",
          theme: "dark"
        },
        social: social || { github: "", twitter: "", linkedin: "" },
        lastActive: new Date()
      },
      { new: true }
    ).select("-password");
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Get user stats
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      chats: user?.stats?.chats || 0,
      messages: user?.stats?.messages || 0,
      daysActive: user ? Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24)) : 1
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;