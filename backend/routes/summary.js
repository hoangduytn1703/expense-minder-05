
const express = require('express');
const router = express.Router();
const Income = require('../models/income');
const Expense = require('../models/expense');

// Get monthly summary
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);
    
    // Calculate previous month and year
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear--;
    }
    
    // Get total income for the current month
    const incomeResult = await Income.aggregate([
      { 
        $match: { 
          month: currentMonth, 
          year: currentYear
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get total expense for the current month
    const expenseResult = await Expense.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate total income and expense from previous month
    const previousMonthIncomeResult = await Income.aggregate([
      { 
        $match: { 
          month: previousMonth, 
          year: previousYear
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const previousMonthExpenseResult = await Expense.aggregate([
      { $match: { month: previousMonth, year: previousYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate current month income
    const currentMonthIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    
    // Calculate previous month's TOTAL income
    const prevTotalIncome = previousMonthIncomeResult.length > 0 ? previousMonthIncomeResult[0].total : 0;
    
    // Calculate previous month's expenses
    const prevExpense = previousMonthExpenseResult.length > 0 ? previousMonthExpenseResult[0].total : 0;
    
    // Calculate what should be carried over (previous month's actual remaining)
    const previousMonthRemaining = prevTotalIncome - prevExpense;
    
    // Calculate totals for current month
    const totalIncome = currentMonthIncome;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const remaining = totalIncome - totalExpense;
    
    res.json({
      currentMonthIncome,
      totalIncome,
      totalExpense,
      remaining,
      previousMonthRemaining
    });
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
