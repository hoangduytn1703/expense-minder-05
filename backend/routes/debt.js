
const express = require('express');
const router = express.Router();
const Debt = require('../models/debt');
const Expense = require('../models/expense');

// Get all debts
router.get('/', async (req, res) => {
  try {
    const debts = await Debt.find().sort({ createdAt: 1 });
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new debt
router.post('/', async (req, res) => {
  // Calculate monthly payment
  const { totalAmount, months, startMonth, startYear } = req.body;
  const monthlyPayment = Math.ceil(totalAmount / months);
  
  const debt = new Debt({
    ...req.body,
    monthlyPayment
  });
  
  try {
    const newDebt = await debt.save();
    
    // Create expense entries for credit payment
    for (let i = 0; i < months; i++) {
      let currentMonth = startMonth + i;
      let currentYear = startYear;
      
      // Adjust for month overflow
      while (currentMonth > 12) {
        currentMonth -= 12;
        currentYear += 1;
      }
      
      // Check if there's already a credit payment for this month
      const existingExpense = await Expense.findOne({
        month: currentMonth,
        year: currentYear,
        category: 'creditPayment',
        note: `Trả nợ: ${debt.name}`
      });
      
      if (existingExpense) {
        // Update existing expense
        existingExpense.amount += monthlyPayment;
        await existingExpense.save();
      } else {
        // Create new expense
        await Expense.create({
          month: currentMonth,
          year: currentYear,
          category: 'creditPayment',
          scope: 'S',
          amount: monthlyPayment,
          note: `Trả nợ: ${debt.name}`
        });
      }
    }
    
    res.status(201).json(newDebt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a debt
router.put('/:id', async (req, res) => {
  try {
    // Get the original debt to compare changes
    const originalDebt = await Debt.findById(req.params.id);
    if (!originalDebt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Recalculate monthly payment if totalAmount or months changed
    let update = { ...req.body };
    if (req.body.totalAmount !== undefined && req.body.months !== undefined) {
      update.monthlyPayment = Math.ceil(req.body.totalAmount / req.body.months);
    }
    
    // Update the debt
    const updatedDebt = await Debt.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    
    // If monthly payment, startMonth, startYear, months or totalAmount changed
    // we need to update the expense entries
    if (originalDebt.monthlyPayment !== updatedDebt.monthlyPayment ||
        originalDebt.startMonth !== updatedDebt.startMonth ||
        originalDebt.startYear !== updatedDebt.startYear ||
        originalDebt.months !== updatedDebt.months) {
      
      // Delete all existing expense entries for this debt
      await Expense.deleteMany({
        note: `Trả nợ: ${originalDebt.name}`
      });
      
      // Create new expense entries
      for (let i = 0; i < updatedDebt.months; i++) {
        let currentMonth = updatedDebt.startMonth + i;
        let currentYear = updatedDebt.startYear;
        
        // Adjust for month overflow
        while (currentMonth > 12) {
          currentMonth -= 12;
          currentYear += 1;
        }
        
        // Check if there's already a credit payment for this month
        const existingExpense = await Expense.findOne({
          month: currentMonth,
          year: currentYear,
          category: 'creditPayment',
          note: `Trả nợ: ${updatedDebt.name}`
        });
        
        if (existingExpense) {
          // Update existing expense
          existingExpense.amount += updatedDebt.monthlyPayment;
          await existingExpense.save();
        } else {
          // Create new expense
          await Expense.create({
            month: currentMonth,
            year: currentYear,
            category: 'creditPayment',
            scope: 'S',
            amount: updatedDebt.monthlyPayment,
            note: `Trả nợ: ${updatedDebt.name}`
          });
        }
      }
    }
    
    res.json(updatedDebt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a debt
router.delete('/:id', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Delete the debt
    await Debt.findByIdAndDelete(req.params.id);
    
    // Delete all expense entries for this debt
    await Expense.deleteMany({
      note: `Trả nợ: ${debt.name}`
    });
    
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
