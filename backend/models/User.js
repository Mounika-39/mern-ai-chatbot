import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, default: "" },
  avatar: { type: String, default: null },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  phone: { type: String, default: "" },
  birthday: { type: Date, default: null },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  preferences: {
    language: { type: String, default: "English" },
    timezone: { type: String, default: "PST (UTC-8)" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    theme: { type: String, default: "dark" }
  },
  social: {
    github: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" }
  },
  stats: {
    chats: { type: Number, default: 0 },
    messages: { type: Number, default: 0 }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;