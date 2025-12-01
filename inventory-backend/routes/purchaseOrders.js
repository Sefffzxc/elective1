import express from 'express';
import r from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create purchase order (from reorder)
router.post('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { supplier_id, product_id, product_name, category, quantity, unit_price } = req.body;

    if (!supplier_id || !product_id || !quantity || !unit_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get supplier info
    const supplier = await r.table('suppliers').get(supplier_id).run();
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get manager info
    const manager = await r.table('managers').get(req.user.id).run();

    // Generate PO number
    const poCount = await r.table('purchase_orders').count().run();
    const po_number = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(5, '0')}`;

    const purchaseOrder = {
      po_number,
      supplier_id,
      supplier_name: supplier.supplier_name,
      manager_id: req.user.id,
      manager_name: manager.fullName,
      items: [{
        product_id,
        product_name,
        category,
        quantity: parseInt(quantity),
        unit_price: parseFloat(unit_price)
      }],
      total_amount: parseFloat(unit_price) * parseInt(quantity),
      status: 'pending',
      order_date: new Date(),
      expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      created_at: new Date()
    };

    const result = await r.table('purchase_orders').insert(purchaseOrder).run();

    if (result.inserted === 1) {
      const newPO = await r.table('purchase_orders').get(result.generated_keys[0]).run();
      
      // Log the purchase order creation
      await r.table('inventory_logs').insert({
        product_id,
        product_name,
        action_type: 'purchase_order_created',
        quantity_change: parseInt(quantity),
        old_stock: 0,
        new_stock: 0,
        reference_id: newPO.id,
        reference_type: 'purchase_order',
        performed_by: manager.fullName,
        notes: `PO ${po_number} created`,
        created_at: new Date()
      }).run();

      res.status(201).json(newPO);
    } else {
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// Get all purchase orders
router.get('/', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = r.table('purchase_orders');
    
    if (status) {
      query = query.filter({ status });
    }
    
    const orders = await query.orderBy(r.desc('order_date')).run();
    res.json(orders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Update purchase order status and stock when received
router.patch('/:id/receive', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const po = await r.table('purchase_orders').get(req.params.id).run();
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (po.status !== 'pending') {
      return res.status(400).json({ error: 'Purchase order already processed' });
    }

    // Update PO status
    await r.table('purchase_orders')
      .get(req.params.id)
      .update({ 
        status: 'received',
        received_date: new Date()
      })
      .run();

    // Update product stock for each item
    for (const item of po.items) {
      const product = await r.table('products').get(item.product_id).run();
      
      if (product) {
        const oldStock = product.stock;
        const newStock = oldStock + item.quantity;
        
        await r.table('products')
          .get(item.product_id)
          .update({ 
            stock: newStock,
            updated_at: new Date()
          })
          .run();

        // Log the restock
        await r.table('inventory_logs').insert({
          product_id: item.product_id,
          product_name: item.product_name,
          action_type: 'restock',
          quantity_change: item.quantity,
          old_stock: oldStock,
          new_stock: newStock,
          reference_id: po.id,
          reference_type: 'purchase_order',
          performed_by: req.user.fullName,
          notes: `PO ${po.po_number} received`,
          created_at: new Date()
        }).run();
      }
    }

    const updatedPO = await r.table('purchase_orders').get(req.params.id).run();
    res.json(updatedPO);
  } catch (error) {
    console.error('Receive purchase order error:', error);
    res.status(500).json({ error: 'Failed to receive purchase order' });
  }
});

export default router;