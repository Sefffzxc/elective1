import { useState, useEffect } from 'react';
import { getLatestAnalytics, computeAnalytics } from '../../services/api';
import { 
  FiTrendingUp,
  FiBox,
  FiPieChart,
  FiUsers,
  FiBarChart2,
  FiClock,
  FiRefreshCw
} from "react-icons/fi";
import { FaChartPie } from "react-icons/fa";
import { FaMedal } from "react-icons/fa";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await getLatestAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeAnalytics = async () => {
    setComputing(true);
    try {
      await computeAnalytics();
      alert('Analytics computed successfully!');
      await loadAnalytics();
    } catch (error) {
      alert('Failed to compute analytics');
      console.error('Compute analytics error:', error);
    } finally {
      setComputing(false);
    }
  };

  if (loading) {
    return <div className="main-content">Loading analytics...</div>;
  }

  const dailySales = analytics?.daily_sales?.details || {};
  const topProducts = analytics?.top_products?.details?.products || [];
  const categoryPerformance = analytics?.category_performance?.details?.categories || [];
  const inventoryHealth = analytics?.inventory_health?.details || {};
  const salesTrend = analytics?.sales_trend?.details?.trend || [];
  const cashierPerformance = analytics?.cashier_performance?.details?.cashiers || [];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1><FaChartPie style={{ marginRight: 8 }} /> Advanced Analytics</h1>
        <p>AI-powered insights and performance metrics</p>
        <button 
        className="btn btn-primary" 
        onClick={handleComputeAnalytics}
        disabled={computing}
        style={{ marginTop: '10px' }}
        >
        {computing ? (
            <><FiClock /> Computing...</>
        ) : (
            <><FiRefreshCw /> Refresh Analytics</>
        )}
        </button>
      </div>

      {/* Daily Sales Overview */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>
        <FiTrendingUp style={{ marginRight: 8 }} /> Today's Performance
        </h2>
        <div className="dashboard-cards">
          <div className="stat-card">
            <h3>Total Sales Today</h3>
            <div className="stat-value">₱{analytics?.daily_sales?.metric_value?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="stat-card">
            <h3>Transactions</h3>
            <div className="stat-value">{dailySales.transactions || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Avg Transaction</h3>
            <div className="stat-value">₱{dailySales.average_transaction?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Inventory Health */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>
        <FiBox style={{ marginRight: 8 }} /> Inventory Health
        </h2>
        <div className="dashboard-cards">
          <div className="stat-card">
            <h3>Total Products</h3>
            <div className="stat-value">{inventoryHealth.total_products || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Critical Stock</h3>
            <div className="stat-value" style={{ color: '#e74c3c' }}>{inventoryHealth.critical_stock || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Low Stock</h3>
            <div className="stat-value" style={{ color: '#f39c12' }}>{inventoryHealth.low_stock || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Healthy Stock</h3>
            <div className="stat-value" style={{ color: '#27ae60' }}>{inventoryHealth.healthy_stock || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Inventory Value</h3>
            <div className="stat-value" style={{ fontSize: '22px' }}>₱{inventoryHealth.total_inventory_value?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="table-container" style={{ marginBottom: '30px' }}>
        <div className="table-header">
        <h2><FiTrendingUp style={{ marginRight: 8 }} /> Top 10 Products by Revenue</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={product.product_id}>
                <td style={{ fontWeight: '700', fontSize: '18px', color: index < 3 ? '#f39c12' : '#7f8c8d' }}>
                    {index === 0 && <FaMedal color="#f1c40f" />}      {/* Gold */}
                    {index === 1 && <FaMedal color="#bdc3c7" />}      {/* Silver */}
                    {index === 2 && <FaMedal color="#cd7f32" />}      {/* Bronze */}
                  {index > 2 && `#${index + 1}`}
                </td>
                <td style={{ fontWeight: '600' }}>{product.product_name}</td>
                <td>{product.category}</td>
                <td>{product.total_quantity}</td>
                <td style={{ fontWeight: '700', color: '#27ae60' }}>₱{product.total_revenue.toFixed(2)}</td>
              </tr>
            ))}
            {topProducts.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No sales data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Category Performance */}
      <div className="table-container" style={{ marginBottom: '30px' }}>
        <div className="table-header">
        <h2><FiPieChart style={{ marginRight: 8 }} /> Category Performance</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Sales</th>
              <th>Items Sold</th>
              <th>Total Revenue</th>
              <th>Avg per Sale</th>
            </tr>
          </thead>
          <tbody>
            {categoryPerformance.sort((a, b) => b.total_revenue - a.total_revenue).map((cat) => (
              <tr key={cat.category}>
                <td style={{ fontWeight: '600' }}>{cat.category}</td>
                <td>{cat.total_sales}</td>
                <td>{cat.total_items}</td>
                <td style={{ fontWeight: '700', color: '#27ae60' }}>₱{cat.total_revenue.toFixed(2)}</td>
                <td>₱{(cat.total_revenue / cat.total_sales).toFixed(2)}</td>
              </tr>
            ))}
            {categoryPerformance.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No category data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cashier Performance */}
      <div className="table-container" style={{ marginBottom: '30px' }}>
        <div className="table-header">
        <h2><FiUsers style={{ marginRight: 8 }} /> Cashier Performance</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Cashier</th>
              <th>Total Transactions</th>
              <th>Total Sales</th>
              <th>Avg Transaction</th>
            </tr>
          </thead>
          <tbody>
            {cashierPerformance.map((cashier, index) => (
              <tr key={cashier.cashier_id}>
                <td style={{ fontWeight: '700', fontSize: '18px' }}>
                    {index === 0 && <FaMedal color="#f1c40f" />}      {/* Gold */}
                    {index === 1 && <FaMedal color="#bdc3c7" />}      {/* Silver */}
                    {index === 2 && <FaMedal color="#cd7f32" />}      {/* Bronze */}
                  {index > 2 && `#${index + 1}`}
                </td>
                <td style={{ fontWeight: '600' }}>{cashier.cashier_name}</td>
                <td>{cashier.total_transactions}</td>
                <td style={{ fontWeight: '700', color: '#27ae60' }}>₱{cashier.total_sales.toFixed(2)}</td>
                <td>₱{(cashier.total_sales / cashier.total_transactions).toFixed(2)}</td>
              </tr>
            ))}
            {cashierPerformance.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No cashier data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sales Trend */}
      <div className="table-container">
        <div className="table-header">
        <h2><FiBarChart2 style={{ marginRight: 8 }} /> 30-Day Sales Trend</h2>
        </div>
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', minWidth: '800px', height: '200px' }}>
            {salesTrend.slice(-14).map((day) => {
              const maxValue = Math.max(...salesTrend.map(d => d.total));
              const height = maxValue > 0 ? (day.total / maxValue) * 180 : 0;
              
              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#27ae60' }}>
                    ₱{day.total.toFixed(0)}
                  </div>
                  <div 
                    style={{ 
                      width: '100%', 
                      backgroundColor: day.total > 0 ? '#3498db' : '#ecf0f1',
                      height: `${height}px`,
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title={`${day.date}: ₱${day.total.toFixed(2)} (${day.transactions} transactions)`}
                  />
                  <div style={{ fontSize: '9px', color: '#7f8c8d', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '12px', color: '#7f8c8d' }}>
        Last computed: {analytics?.daily_sales?.computed_at ? new Date(analytics.daily_sales.computed_at).toLocaleString() : 'Never'}
        <br />
        Auto-refresh: Every 6 hours | Manual refresh available above
      </div>
    </div>
  );
}

export default Analytics;