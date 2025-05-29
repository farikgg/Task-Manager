const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#7d7d7d' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null для дефолтных
  isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('Category', CategorySchema);