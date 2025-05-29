const { validationResult } = require("express-validator");
const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  { name: "Работа", color: "#7d7d7d", isDefault: true },
  { name: "Личное", color: "#2ba9fc", isDefault: true },
  { name: "Другое", color: "#FFE66D", isDefault: true }
];

exports.initDefaultCategories = async () => {
  try {
    for (const category of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: category.name }, // Условие поиска
        { $setOnInsert: category }, // Данные для создания
        { upsert: true } // Создать если не найдено
      );
    }
    console.log("Стандартные категории проверены/созданы");
  } catch (error) {
    console.error("Ошибка инициализации категорий:", error.message);
  }
};

// Создание новой категории (POST /categories)
exports.createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    // Проверка на дубликат для этого пользователя
    const exists = await Category.findOne({ name, userId: req.user.userId });
    if (exists) {
      return res.status(400).json({ message: "Категория уже существует" });
    }
    const newCategory = await Category.create({
      name,
      color: color || "#7d7d7d",
      userId: req.user.userId,
      isDefault: false
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { userId: req.user.userId }
      ]
    }).sort({ isDefault: -1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при загрузке категорий" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }
    res.json({ message: "Категория удалена" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении категории" });
  }
};

module.exports = exports;