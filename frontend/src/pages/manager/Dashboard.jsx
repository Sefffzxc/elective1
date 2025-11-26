import { useState, useEffect } from 'react';
import { getDashboard, getTopProducts, getSalesTrend } from '../../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  const ws = new WebSocket("ws://localhost:4001");

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "products_update") {
      loadData(); // Refresh products, low-stock, dashboard numbers
    }

    if (msg.type === "sales_update") {
      loadData(); // Refresh sales data, history, dashboard, charts
    }
  };

  return () => ws.close();
}, []);

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      const [dashboardRes, topProductsRes, trendRes] = await Promise.all([
        getDashboard(),
        getTopProducts(5),
        getSalesTrend(7)
      ]);

      setStats(dashboardRes.data);
      setTopProducts(topProductsRes.data);
      setSalesTrend(trendRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your inventory system</p>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Today's Sales</h3>
          <div className="stat-value">₱{stats?.totalSalesToday?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="stat-card">
          <h3>Transactions Today</h3>
          <div className="stat-value">{stats?.transactionsToday || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">₱{stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            {stats?.lowStockCount || 0}
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Top Selling Products</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.total_quantity}</td>
                <td>₱{product.total_revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Sales Trend (Last 7 Days)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transactions</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesTrend.map((day, index) => (
              <tr key={index}>
                <td>{new Date(day.date).toLocaleDateString()}</td>
                <td>{day.transactions}</td>
                <td>₱{day.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;