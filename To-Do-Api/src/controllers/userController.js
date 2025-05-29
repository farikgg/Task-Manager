const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Получить профиль пользователя
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля', error: error.message });
  }
};

// Обновить профиль пользователя (имя, email, настройки)
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, settings } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (settings) updateData.settings = settings;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, select: '-password -refreshTokens' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

// Смена пароля
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Текущий пароль неверен' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка смены пароля', error: error.message });
  }
}; 