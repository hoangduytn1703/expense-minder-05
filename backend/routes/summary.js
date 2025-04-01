
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
    
    // Get total income for the current month (excluding previousMonth category)
    const incomeResult = await Income.aggregate([
      { 
        $match: { 
          month: currentMonth, 
          year: currentYear,
          category: { $ne: 'previousMonth' } // Exclude previousMonth category to avoid double counting
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get previousMonth income entry specifically
    const previousMonthIncomeEntry = await Income.findOne({
      month: currentMonth,
      year: currentYear,
      category: 'previousMonth'
    });
    
    // Get total expense for the current month
    const expenseResult = await Expense.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate total income from previous month
    const previousMonthIncomeResult = await Income.aggregate([
      { 
        $match: { 
          month: previousMonth, 
          year: previousYear,
          category: { $ne: 'previousMonth' } // Exclude previousMonth from previous month too
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate total expense from previous month
    const previousMonthExpenseResult = await Expense.aggregate([
      { $match: { month: previousMonth, year: previousYear } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate current month income (excluding the previousMonth entry)
    const currentMonthIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    
    // Add the previousMonth income entry amount if it exists
    const previousMonthAmount = previousMonthIncomeEntry ? previousMonthIncomeEntry.amount : 0;
    
    // Total income includes both current month income and previous month's remaining
    const totalIncome = currentMonthIncome + previousMonthAmount;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    
    // Calculate previous month remaining
    const prevIncome = previousMonthIncomeResult.length > 0 ? previousMonthIncomeResult[0].total : 0;
    const prevExpense = previousMonthExpenseResult.length > 0 ? previousMonthExpenseResult[0].total : 0;
    const previousMonthRemaining = prevIncome - prevExpense;
    
    res.json({
      currentMonthIncome, // Add this to fix the calculation issue
      previousMonthAmount, // Add this to see the amount being carried over
      totalIncome,
      totalExpense,
      remaining: totalIncome - totalExpense,
      previousMonthRemaining
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
