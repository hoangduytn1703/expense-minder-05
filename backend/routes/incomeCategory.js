
const express = require('express');
const router = express.Router();
const IncomeCategory = require('../models/incomeCategory');
const mongoose = require('mongoose');

// Get all income categories
router.get('/', async (req, res) => {
  try {
    const categories = await IncomeCategory.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new income category
router.post('/', async (req, res) => {
  const category = new IncomeCategory(req.body);
  
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an income category
router.put('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const updatedCategory = await IncomeCategory.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an income category
router.delete('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const category = await IncomeCategory.findOneAndDelete({ id: req.params.id });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
