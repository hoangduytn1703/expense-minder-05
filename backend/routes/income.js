
const express = require('express');
const router = express.Router();
const Income = require('../models/income');

// Get all incomes
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = {};
    if (month && year) {
      query = { month: parseInt(month), year: parseInt(year) };
    }
    
    const incomes = await Income.find(query).sort({ createdAt: 1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new income
router.post('/', async (req, res) => {
  const income = new Income(req.body);
  
  try {
    const newIncome = await income.save();
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an income
router.put('/:id', async (req, res) => {
  try {
    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedIncome) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json(updatedIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an income
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
