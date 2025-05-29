const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Category = require("../models/Category");

// Создать новую задачу
exports.createTask = async (req, res) => {
  // Проверка валидации
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, categories_id, isCompleted, dueDate } = req.body;

    // Проверка существования категории
    if (categories_id) {
      const categoryExists = await Category.findById(categories_id);
      if (!categoryExists) {
        return res.status(400).json({ message: "Категория не найдена" });
      }
    }

    const newTask = new Task({
      user_id: req.user.userId,
      title,
      description,
      categories_id,
      isCompleted: isCompleted || false,
      dueDate
    });

    await newTask.save();
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    res.status(500).json({ message: "Ошибка при создании задачи", error: error.message });
  }
};

// Получить все задачи пользователя
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user_id: req.user.userId }).populate("categories_id");
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    res.status(500).json({ message: "Ошибка при получении задач", error: error.message });
  }
};

// // Обновить задачу
// exports.updateTask = async (req, res) => {
//   // Проверка валидации
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { title, description, categories_id, status, dueDate } = req.body;

//     if (categories_id) {
//       const categoryExists = await Category.findById(categories_id);
//       if (!categoryExists) {
//         return res.status(400).json({ message: "Категория не найдена" });
//       }
//     }

//     const updatedTask = await Task.findOneAndUpdate(
//       { _id: req.params.id, user_id: req.user.id },
//       { title, description, categories_id, status, dueDate },
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: "Задача не найдена" });
//     }

//     res.json({ message: "Задача обновлена", task: updatedTask });
//   } catch (error) {
//     res.status(500).json({ message: "Ошибка при обновлении задачи", error: error.message });
//   }
// };




exports.updateTaskStatus = async (req, res) => {
  const { isCompleted } = req.body;

  // Валидация isCompleted
  if (typeof isCompleted !== 'boolean') {
    return res.status(400).json({ message: "isCompleted должно быть булевым значением" });
  }

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.userId },
      { isCompleted },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    res.status(500).json({ message: "Ошибка при обновлении статуса", error: error.message });
  }
};







// Удалить задачу
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user_id: req.user.userId });

    if (!deletedTask) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.json({ success: true, message: "Задача удалена" });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    res.status(500).json({ message: "Ошибка при удалении задачи", error: error.message });
  }
};
