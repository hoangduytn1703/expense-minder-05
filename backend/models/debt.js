
const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  months: {
    type: Number,
    required: true,
    min: 1
  },
  startMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  startYear: {
    type: Number,
    required: true
  },
  monthlyPayment: {
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

// Middleware to calculate monthly payment before saving
DebtSchema.pre('save', function(next) {
  if (this.totalAmount && this.months) {
    this.monthlyPayment = Math.ceil(this.totalAmount / this.months);
  }
  next();
});

module.exports = mongoose.model('Debt', DebtSchema);
