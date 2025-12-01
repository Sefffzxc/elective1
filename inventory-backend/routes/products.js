import express from 'express';
import r from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await r.table('products').orderBy('name').run();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get products by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const products = await r.table('products')
      .filter({ category: req.params.category })
      .orderBy('name')
      .run();
    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get categories
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const categories = await r.table('products')
      .pluck('category')
      .distinct()
      .run();
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add product (Manager only)
router.post('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { name, category, price, stock, barcode } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = {
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      barcode: barcode || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await r.table('products').insert(product).run();
    
    if (result.inserted === 1) {
      const newProduct = await r.table('products').get(result.generated_keys[0]).run();
      res.status(201).json(newProduct);
    } else {
      res.status(500).json({ error: 'Failed to add product' });
    }
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product (Manager only)
router.put('/:id', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { name, category, price, stock, barcode } = req.body;

    const updates = {
      updated_at: new Date()
    };

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = parseFloat(price);
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (barcode !== undefined) updates.barcode = barcode;

    const result = await r.table('products')
      .get(req.params.id)
      .update(updates, { returnChanges: true })
      .run();

    if (result.replaced === 1) {
      res.json(result.changes[0].new_val);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (Manager only)
router.delete('/:id', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const result = await r.table('products').get(req.params.id).delete().run();
    
    if (result.deleted === 1) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;