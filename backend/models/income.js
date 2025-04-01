
const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
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
      'salary', 'freelance', 'bonus', 'debtCollection', 
      'previousMonth', 'advance', 'hui', 'other'
    ]
  },
  amount: {
    type: Number,
    required: true,
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
IncomeSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Income', IncomeSchema);
