import r from '../config/database.js';

export const computeDailyAnalytics = async () => {
  try {
    console.log('Computing daily analytics...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Daily Sales Analytics
    const dailySales = await r.table('sales')
      .filter(r.row('created_at').during(today, tomorrow))
      .run();

    const dailySalesTotal = dailySales.reduce((sum, sale) => sum + sale.total, 0);
    const dailyTransactions = dailySales.length;

    await r.table('analytics').insert({
      metric_type: 'daily_sales',
      metric_name: 'Total Daily Sales',
      metric_value: dailySalesTotal,
      period: 'daily',
      date: today,
      details: {
        transactions: dailyTransactions,
        average_transaction: dailyTransactions > 0 ? dailySalesTotal / dailyTransactions : 0
      },
      computed_at: new Date()
    }).run();

    // 2. Top Products Analytics
    const allSales = await r.table('sales').run();
    const productSales = {};
    
    allSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            product_name: item.name,
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
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    await r.table('analytics').insert({
      metric_type: 'top_products',
      metric_name: 'Top 10 Products by Revenue',
      metric_value: topProducts.length,
      period: 'all_time',
      date: today,
      details: {
        products: topProducts
      },
      computed_at: new Date()
    }).run();

    // 3. Category Performance
    const categorySales = {};
    
    allSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!categorySales[item.category]) {
          categorySales[item.category] = {
            category: item.category,
            total_sales: 0,
            total_items: 0,
            total_revenue: 0
          };
        }
        categorySales[item.category].total_sales += 1;
        categorySales[item.category].total_items += item.quantity;
        categorySales[item.category].total_revenue += item.subtotal;
      });
    });

    await r.table('analytics').insert({
      metric_type: 'category_performance',
      metric_name: 'Sales by Category',
      metric_value: Object.keys(categorySales).length,
      period: 'all_time',
      date: today,
      details: {
        categories: Object.values(categorySales)
      },
      computed_at: new Date()
    }).run();

    // 4. Inventory Health
    const products = await r.table('products').run();
    const criticalStock = products.filter(p => p.stock <= 5).length;
    const lowStock = products.filter(p => p.stock > 5 && p.stock < 10).length;
    const healthyStock = products.filter(p => p.stock >= 10).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    await r.table('analytics').insert({
      metric_type: 'inventory_health',
      metric_name: 'Current Inventory Status',
      metric_value: products.length,
      period: 'current',
      date: today,
      details: {
        total_products: products.length,
        critical_stock: criticalStock,
        low_stock: lowStock,
        healthy_stock: healthyStock,
        total_inventory_value: totalValue,
        breakdown: {
          critical: criticalStock,
          low: lowStock,
          healthy: healthyStock
        }
      },
      computed_at: new Date()
    }).run();

    // 5. Sales Trend (Last 30 Days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await r.table('sales')
      .filter(r.row('created_at').ge(thirtyDaysAgo))
      .orderBy('created_at')
      .run();

    const dailyTrend = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyTrend[dateKey] = { date: dateKey, total: 0, transactions: 0 };
    }

    recentSales.forEach(sale => {
      const dateKey = new Date(sale.created_at).toISOString().split('T')[0];
      if (dailyTrend[dateKey]) {
        dailyTrend[dateKey].total += sale.total;
        dailyTrend[dateKey].transactions += 1;
      }
    });

    await r.table('analytics').insert({
      metric_type: 'sales_trend',
      metric_name: '30-Day Sales Trend',
      metric_value: recentSales.length,
      period: '30_days',
      date: today,
      details: {
        trend: Object.values(dailyTrend)
      },
      computed_at: new Date()
    }).run();

    // 6. Cashier Performance
    const cashierStats = {};
    
    allSales.forEach(sale => {
      if (!cashierStats[sale.cashier_id]) {
        cashierStats[sale.cashier_id] = {
          cashier_id: sale.cashier_id,
          cashier_name: sale.cashier_name,
          total_sales: 0,
          total_transactions: 0
        };
      }
      cashierStats[sale.cashier_id].total_sales += sale.total;
      cashierStats[sale.cashier_id].total_transactions += 1;
    });

    await r.table('analytics').insert({
      metric_type: 'cashier_performance',
      metric_name: 'Cashier Sales Performance',
      metric_value: Object.keys(cashierStats).length,
      period: 'all_time',
      date: today,
      details: {
        cashiers: Object.values(cashierStats).sort((a, b) => b.total_sales - a.total_sales)
      },
      computed_at: new Date()
    }).run();

    console.log('✅ Analytics computed successfully');
    return { success: true, message: 'Analytics computed successfully' };
  } catch (error) {
    console.error('Analytics computation error:', error);
    throw error;
  }
};

export const getLatestAnalytics = async (metricType) => {
  try {
    const analytics = await r.table('analytics')
      .filter({ metric_type: metricType })
      .orderBy(r.desc('computed_at'))
      .limit(1)
      .run();

    return analytics.length > 0 ? analytics[0] : null;
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
};

export const getAllLatestAnalytics = async () => {
  try {
    const metricTypes = [
      'daily_sales',
      'top_products',
      'category_performance',
      'inventory_health',
      'sales_trend',
      'cashier_performance'
    ];

    const analytics = {};

    for (const type of metricTypes) {
      const data = await getLatestAnalytics(type);
      analytics[type] = data;
    }

    return analytics;
  } catch (error) {
    console.error('Get all analytics error:', error);
    throw error;
  }
};