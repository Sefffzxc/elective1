import express from 'express';
import r from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all suppliers
router.get('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const suppliers = await r.table('suppliers').orderBy('supplier_name').run();
    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get suppliers by category
router.get('/by-category/:category', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const suppliers = await r.table('suppliers')
      .filter(r.row('categories').contains(req.params.category))
      .orderBy('supplier_name')
      .run();
    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers by category error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Add supplier
router.post('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { supplier_name, contact_person, email, phone, address, categories, payment_terms } = req.body;

    if (!supplier_name || !contact_person || !email || !categories || categories.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supplier = {
      supplier_name,
      contact_person,
      email,
      phone: phone || '',
      address: address || '',
      categories,
      payment_terms: payment_terms || 'Net 30',
      created_at: new Date()
    };

    const result = await r.table('suppliers').insert(supplier).run();
    
    if (result.inserted === 1) {
      const newSupplier = await r.table('suppliers').get(result.generated_keys[0]).run();
      res.status(201).json(newSupplier);
    } else {
      res.status(500).json({ error: 'Failed to add supplier' });
    }
  } catch (error) {
    console.error('Add supplier error:', error);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});

export default router;