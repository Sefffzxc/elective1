import express from 'express';
import r from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create sale
router.post('/', authenticateToken, authorizeRole('cashier', 'manager'), async (req, res) => {
  try {
    const { items, total, payment_method, customer_name } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in sale' });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    // Get full cashier information from database
    let cashierInfo;
    if (req.user.role === 'cashier') {
      cashierInfo = await r.table('cashiers').get(req.user.id).run();
    } else {
      cashierInfo = await r.table('managers').get(req.user.id).run();
    }

    if (!cashierInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify stock availability
    for (const item of items) {
      const product = await r.table('products').get(item.product_id).run();
      
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.name}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // Create sale record
    const sale = {
      cashier_id: req.user.id,
      cashier_name: cashierInfo.fullName,
      items,
      total: parseFloat(total),
      payment_method: payment_method || 'cash',
      customer_name: customer_name.trim(),
      created_at: new Date()
    };

    const saleResult = await r.table('sales').insert(sale).run();

    // Update product stocks
    for (const item of items) {
      await r.table('products')
        .get(item.product_id)
        .update({ 
          stock: r.row('stock').sub(item.quantity),
          updated_at: new Date()
        })
        .run();
    }

    const newSale = await r.table('sales').get(saleResult.generated_keys[0]).run();
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Get all sales (Manager only)
router.get('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const sales = await r.table('sales')
      .orderBy(r.desc('created_at'))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .run();
    
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get cashier's sales
router.get('/my-sales', authenticateToken, authorizeRole('cashier'), async (req, res) => {
  try {
    const sales = await r.table('sales')
      .filter({ cashier_id: req.user.id })
      .orderBy(r.desc('created_at'))
      .limit(50)
      .run();
    
    res.json(sales);
  } catch (error) {
    console.error('Get my sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sales by date range (Manager only)
router.get('/date-range', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }

    const sales = await r.table('sales')
      .between(new Date(start_date), new Date(end_date), { index: 'created_at' })
      .orderBy(r.desc('created_at'))
      .run();
    
    res.json(sales);
  } catch (error) {
    console.error('Get sales by date error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

export default router;