const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Функция для генерации access и refresh токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Регистрация нового пользователя
const registerUser = async (req, res) => {
  // Проверка валидации входных данных
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Никнейм уже занят" });
    }

    // Хеширование пароля для безопасного хранения
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание нового пользователя
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Регистрация успешна" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Аутентификация пользователя
const loginUser = async (req, res) => {
  // Проверка валидации входных данных
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Поиск пользователя в базе данных
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Неверное имя пользователя" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Настройка срока действия refresh токена
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Сохранение refresh токена в базе данных
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt
    });

    // Ограничение количества refresh токенов (максимум 5)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Установка refresh токена в HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Обновление токенов
const refreshToken = async (req, res) => {
  try {
    // Получение refresh токена из cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Проверка валидности refresh токена
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Поиск и валидация refresh токена в базе данных
    const tokenIndex = user.refreshTokens.findIndex(
      token => token.token === refreshToken && token.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Генерация новых токенов
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Обновление refresh токена в базе данных
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    user.refreshTokens[tokenIndex] = {
      token: newRefreshToken,
      expiresAt
    };

    await user.save();

    // Установка нового refresh токена в cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true, // Защита от доступа к cookie из JavaScript
      secure: process.env.NODE_ENV === 'production', // Использование HTTPS в production
      sameSite: 'strict', // Запрет на передачу cookie на другие сайты
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Выход из системы
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    // Удаление refresh токена из базы данных
    if (refreshToken) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          token => token.token !== refreshToken
        );
        await user.save();
      }
    }

    // Очистка cookie
    res.clearCookie('refreshToken');
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Получить профиль пользователя
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const isGoogle = !!user.googleId;

    res.json({
      isGoogle,
      username: user.username,
      email: user.email,
      google_username: user.google_username,
      google_email: user.google_email,
      categories: user.categories || [],
      themeColor: user.themeColor || 'blue'
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Текущий и новый пароль обязательны" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "У пользователя нет локального пароля" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Текущий пароль неверен" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Пароль успешно изменён" });
  } catch (err) {
    console.error('Ошибка смены пароля:', err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// Обновить профиль пользователя
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.userId; // Получаем userId из токена (добавлено middleware)
    const { username, email, categories, themeColor } = req.body; // Добавляем categories и themeColor

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Обновляем только предоставленные поля
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (categories !== undefined) user.categories = categories; // Сохраняем категории
    if (themeColor !== undefined) user.themeColor = themeColor; // Сохраняем themeColor

    await user.save();

    res.json({ message: "Профиль обновлен успешно" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Обновить категории пользователя
const updateCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    if (!Array.isArray(req.body.categories)) {
      return res.status(400).json({ message: "categories должен быть массивом" });
    }
    user.categories = req.body.categories;
    await user.save();
    res.json({ message: "Категории обновлены" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

// Обновить цветовую схему пользователя
const updateThemeColor = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    if (typeof req.body.themeColor !== 'string') {
      return res.status(400).json({ message: "themeColor должен быть строкой" });
    }
    user.themeColor = req.body.themeColor;
    await user.save();
    res.json({ message: "Цветовая схема обновлена" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

module.exports = { registerUser, loginUser, refreshToken, logout, getProfile, updateProfile, changePassword, updateCategories, updateThemeColor };