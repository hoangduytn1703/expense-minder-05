
const express = require('express');
const router = express.Router();
const Debt = require('../models/debt');

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
  const { totalAmount, months } = req.body;
  const monthlyPayment = Math.ceil(totalAmount / months);
  
  const debt = new Debt({
    ...req.body,
    monthlyPayment
  });
  
  try {
    const newDebt = await debt.save();
    res.status(201).json(newDebt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a debt
router.put('/:id', async (req, res) => {
  try {
    // Recalculate monthly payment if totalAmount or months changed
    let update = { ...req.body };
    if (req.body.totalAmount !== undefined && req.body.months !== undefined) {
      update.monthlyPayment = Math.ceil(req.body.totalAmount / req.body.months);
    }
    
    const updatedDebt = await Debt.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    
    if (!updatedDebt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    res.json(updatedDebt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a debt
router.delete('/:id', async (req, res) => {
  try {
    const debt = await Debt.findByIdAndDelete(req.params.id);
    
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
