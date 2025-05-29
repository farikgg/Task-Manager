const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  categories_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", TaskSchema);