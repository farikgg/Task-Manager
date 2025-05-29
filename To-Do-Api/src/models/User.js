const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String, required: false },
  googleId: { type: String },
  google_email: { type: String },
  google_username: { type: String },
  refreshTokens: [{ 
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
  }],
  settings: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'ru' },
    notifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);