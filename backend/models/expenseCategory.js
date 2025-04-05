
const mongoose = require('mongoose');

const ExpenseCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    required: true,
    enum: ['S', 'L', 'C', 'B', 'Đ']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExpenseCategory', ExpenseCategorySchema);
