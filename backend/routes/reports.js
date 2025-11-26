import express from 'express';
import r from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total products
    const totalProducts = await r.table('products').count().run();

    // Total sales today
    const salesToday = await r.table('sales')
      .filter(r.row('created_at').ge(today))
      .run();

    const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.total, 0);
    const transactionsToday = salesToday.length;

    // Total sales all time
    const allSales = await r.table('sales').run();
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total, 0);

    // Low stock products (stock < 20)
    const lowStock = await r.table('products')
      .filter(r.row('stock').lt(20))
      .count()
      .run();

    res.json({
      totalProducts,
      totalSalesToday,
      transactionsToday,
      totalRevenue,
      lowStockCount: lowStock
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Top selling products
router.get('/top-products', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const sales = await r.table('sales').run();
    
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            name: item.name,
            category: item.category,
            total_quantity: 0,
            total_revenue: 0
          };
        }
        productSales[item.product_id].total_quantity += item.quantity;
        productSales[item.product_id].total_revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, parseInt(limit));

    res.json(topProducts);
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Sales by category
router.get('/sales-by-category', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const sales = await r.table('sales').run();
    
    const categorySales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!categorySales[item.category]) {
          categorySales[item.category] = {
            category: item.category,
            total_sales: 0,
            total_items: 0
          };
        }
        categorySales[item.category].total_sales += item.subtotal;
        categorySales[item.category].total_items += item.quantity;
      });
    });

    res.json(Object.values(categorySales));
  } catch (error) {
    console.error('Sales by category error:', error);
    res.status(500).json({ error: 'Failed to fetch category sales' });
  }
});

// Low stock products
router.get('/low-stock', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const { threshold = 20 } = req.query;
    
    const products = await r.table('products')
      .filter(r.row('stock').lt(parseInt(threshold)))
      .orderBy('stock')
      .run();

    res.json(products);
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// Sales trend (last 7 days)
router.get('/sales-trend', authenticateToken, authorizeRole('manager'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await r.table('sales')
      .filter(r.row('created_at').ge(startDate))
      .orderBy('created_at')
      .run();

    const dailySales = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailySales[dateKey] = { date: dateKey, total: 0, transactions: 0 };
    }

    sales.forEach(sale => {
      const dateKey = new Date(sale.created_at).toISOString().split('T')[0];
      if (dailySales[dateKey]) {
        dailySales[dateKey].total += sale.total;
        dailySales[dateKey].transactions += 1;
      }
    });

    res.json(Object.values(dailySales));
  } catch (error) {
    console.error('Sales trend error:', error);
    res.status(500).json({ error: 'Failed to fetch sales trend' });
  }
});

export default router;