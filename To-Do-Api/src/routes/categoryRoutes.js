const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createCategory, getCategories, deleteCategory } = require("../controllers/categoryController");

router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("Название категории обязательно"),
    body("color").optional().isHexColor().withMessage("Некорректный цвет")
  ],
  createCategory
);

router.get("/", auth, getCategories); // Получить список категорий

router.delete("/:id", auth, deleteCategory);

module.exports = router;