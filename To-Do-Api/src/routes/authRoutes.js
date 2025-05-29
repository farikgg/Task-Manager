const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, refreshToken, logout, getProfile, updateProfile, changePassword, updateCategories, updateThemeColor } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login', session: false }),
  async (req, res) => {
    // Генерируем access и refresh токены
    const accessToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    // Сохраняем refresh токен в БД
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    req.user.refreshTokens = req.user.refreshTokens || [];
    req.user.refreshTokens.push({ token: refreshToken, expiresAt });
    if (req.user.refreshTokens.length > 5) {
      req.user.refreshTokens = req.user.refreshTokens.slice(-5);
    }
    await req.user.save();
    // Устанавливаем refresh токен в cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });
    // Редиректим на фронт с accessToken
    res.redirect(`${process.env.CLIENT_URL}/login?googleToken=${accessToken}`);
  }
);

// Профиль пользователя
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);
router.put('/categories', authMiddleware, updateCategories);
router.put('/theme', authMiddleware, updateThemeColor);

module.exports = router;