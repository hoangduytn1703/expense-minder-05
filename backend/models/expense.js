
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'breakfast', 'lunch', 'dinner', 'shopping', 'rent',
      'sendHome', 'transport', 'fee', 'entertainment',
      'longTermSaving', 'emergencySaving', 'investment',
      'debtPayment', 'creditPayment', 'additional', 'special'
    ]
  },
  scope: {
    type: String,
    required: true,
    enum: ['S', 'L', 'C', 'B', 'Đ']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  actualAmount: {
    type: Number,
    min: 0
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries by month and year
ExpenseSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
