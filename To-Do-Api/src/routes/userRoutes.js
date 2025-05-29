const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Получить профиль
router.get('/profile', auth, userController.getProfile);

// Обновить профиль
router.put('/profile',
  auth,
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Имя пользователя должно быть не менее 3 символов'),
    body('settings').optional().isObject().withMessage('Настройки должны быть объектом')
  ],
  userController.updateProfile
);

// Смена пароля
router.post('/profile/change-password',
  auth,
  [
    body('currentPassword').isLength({ min: 6 }).withMessage('Текущий пароль обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен быть не менее 6 символов')
  ],
  userController.changePassword
);

module.exports = router; 