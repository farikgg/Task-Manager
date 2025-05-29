const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Passport и Google OAuth
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const { initDefaultCategories } = require("./controllers/categoryController");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        username: profile.displayName,
        googleId: profile.id,
        google_email: profile.emails[0].value
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

//Подключение к БД
connectDB();
mongoose.connection.once("open", () => {
  initDefaultCategories().catch(console.error);
});

// Роуты
app.use('/api/auth', authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", userRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});