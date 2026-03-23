import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const uri = process.env.MONGODB_URI;
let db;
let usersCollection;
let sessionsCollection;

async function connectDB() {
  if (!uri) {
    console.log("⚠️ No MongoDB URI found, using in-memory storage");
    return;
  }
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("ai-chatbot");
    usersCollection = db.collection("users");
    sessionsCollection = db.collection("sessions");
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
}

connectDB();

// Helper functions
function generateToken() {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    // Check if user exists
    let existingUser = null;
    if (usersCollection) {
      existingUser = await usersCollection.findOne({ email });
    } else {
      // Fallback to in-memory
      existingUser = globalUsers?.find(u => u.email === email);
    }
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const newUser = {
      name: name || email.split('@')[0],
      email: email,
      password: password, // In production, hash this!
      avatar: null,
      createdAt: new Date(),
      preferences: { theme: "dark" }
    };
    
    let savedUser;
    if (usersCollection) {
      const result = await usersCollection.insertOne(newUser);
      savedUser = { id: result.insertedId, ...newUser };
    } else {
      // In-memory fallback
      if (!globalUsers) globalUsers = [];
      savedUser = { id: globalUsers.length + 1, ...newUser };
      globalUsers.push(savedUser);
    }
    
    const token = generateToken();
    
    if (sessionsCollection) {
      await sessionsCollection.insertOne({ token, userId: savedUser.id, createdAt: new Date() });
    } else {
      if (!globalSessions) globalSessions = {};
      globalSessions[token] = { userId: savedUser.id };
    }
    
    res.json({
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        avatar: savedUser.avatar,
        preferences: savedUser.preferences
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = null;
    if (usersCollection) {
      user = await usersCollection.findOne({ email, password });
    } else {
      user = globalUsers?.find(u => u.email === email && u.password === password);
    }
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = generateToken();
    
    if (sessionsCollection) {
      await sessionsCollection.insertOne({ token, userId: user._id || user.id, createdAt: new Date() });
    } else {
      if (!globalSessions) globalSessions = {};
      globalSessions[token] = { userId: user._id || user.id };
    }
    
    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
app.get("/api/user/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    let session = null;
    if (sessionsCollection) {
      session = await sessionsCollection.findOne({ token });
    } else {
      session = globalSessions?.[token];
    }
    
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    let user = null;
    if (usersCollection) {
      user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    } else {
      user = globalUsers?.find(u => u.id === session.userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      username: user.username || user.name.toLowerCase(),
      avatar: user.avatar,
      joinDate: user.createdAt,
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
app.put("/api/user/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    let session = null;
    if (sessionsCollection) {
      session = await sessionsCollection.findOne({ token });
    } else {
      session = globalSessions?.[token];
    }
    
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    const { name, username, bio, location, avatar, preferences } = req.body;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (usersCollection) {
      await usersCollection.updateOne(
        { _id: new ObjectId(session.userId) },
        { $set: updateData }
      );
    } else {
      const userIndex = globalUsers.findIndex(u => u.id === session.userId);
      if (userIndex !== -1) {
        globalUsers[userIndex] = { ...globalUsers[userIndex], ...updateData };
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// CHAT ENDPOINT
// ============================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    console.log("📨 Message:", message);
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.json({ reply: "⚠️ Add OPENROUTER_API_KEY to .env" });
    }
    
    // Build conversation
    const messages = [
      { role: "system", content: "You are a helpful AI assistant." }
    ];
    
    if (history && history.length > 0) {
      const recent = history.slice(-10);
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    
    messages.push({ role: "user", content: message });
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );
    
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
    
  } catch (error) {
    console.error("Chat error:", error.message);
    res.json({ reply: `I understand you're asking about "${req.body.message}". Please try again.` });
  }
});

// Notifications
app.get("/api/notifications", (req, res) => {
  res.json({ notifications: [] });
});

// In-memory fallback storage
let globalUsers = [];
let globalSessions = {};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 MongoDB: ${uri ? "✅ Configured" : "❌ Not configured (using in-memory)"}`);
  console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? "✅ Ready" : "❌ Missing"}`);
});