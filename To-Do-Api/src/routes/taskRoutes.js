const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

const validateTask = [
  body("title").notEmpty().withMessage("Название обязательно"),
  body("dueDate").optional().isISO8601().withMessage("Дата должна быть в формате YYYY-MM-DD")
];

router.post("/", authMiddleware, validateTask, taskController.createTask);
router.get("/", authMiddleware, taskController.getTasks);
// router.put("/:id", authMiddleware, validateTask, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);
router.patch("/:id/status", authMiddleware, taskController.updateTaskStatus);


module.exports = router;