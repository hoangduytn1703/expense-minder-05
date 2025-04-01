
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expense');
const debtRoutes = require('./routes/debt');
const summaryRoutes = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080'
}));
app.use(express.json());

// Routes
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/summary', summaryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
